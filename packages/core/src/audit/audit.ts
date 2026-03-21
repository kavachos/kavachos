import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "../db/database.js";
import { auditLogs } from "../db/schema.js";
import type { AuditEntry, AuditExportOptions, AuditFilter } from "../types.js";

interface AuditModuleConfig {
	db: Database;
}

/**
 * Create the audit log module.
 * Provides query and export capabilities for the immutable audit trail.
 */
export function createAuditModule(config: AuditModuleConfig) {
	const { db } = config;

	async function query(filter: AuditFilter): Promise<AuditEntry[]> {
		const conditions = [];

		if (filter.agentId) conditions.push(eq(auditLogs.agentId, filter.agentId));
		if (filter.userId) conditions.push(eq(auditLogs.userId, filter.userId));
		if (filter.since) conditions.push(gte(auditLogs.timestamp, filter.since));
		if (filter.until) conditions.push(lte(auditLogs.timestamp, filter.until));
		if (filter.result) conditions.push(eq(auditLogs.result, filter.result));

		let q = db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).$dynamic();

		if (conditions.length > 0) {
			q = q.where(and(...conditions));
		}

		if (filter.limit) {
			q = q.limit(filter.limit);
		}
		if (filter.offset) {
			q = q.offset(filter.offset);
		}

		const rows = await q;

		return rows
			.filter((row) => {
				// Filter by actions if specified
				if (filter.actions && filter.actions.length > 0) {
					return filter.actions.includes(row.action);
				}
				return true;
			})
			.map(toAuditEntry);
	}

	async function exportLogs(options: AuditExportOptions): Promise<string> {
		const entries = await query({
			since: options.since,
			until: options.until,
			limit: 10000, // cap exports
		});

		if (options.format === "json") {
			return JSON.stringify(entries, null, 2);
		}

		// CSV format
		const headers = [
			"id",
			"agentId",
			"userId",
			"action",
			"resource",
			"result",
			"reason",
			"durationMs",
			"tokensCost",
			"timestamp",
		];
		const csvRows = [headers.join(",")];

		for (const entry of entries) {
			csvRows.push(
				[
					entry.id,
					entry.agentId,
					entry.userId,
					entry.action,
					entry.resource,
					entry.result,
					`"${(entry as AuditEntry & { reason?: string }).reason ?? ""}"`,
					entry.durationMs,
					entry.tokensCost ?? "",
					entry.timestamp.toISOString(),
				].join(","),
			);
		}

		return csvRows.join("\n");
	}

	return { query, export: exportLogs };
}

function toAuditEntry(row: typeof auditLogs.$inferSelect): AuditEntry {
	return {
		id: row.id,
		agentId: row.agentId,
		userId: row.userId,
		action: row.action,
		resource: row.resource,
		parameters: (row.parameters as Record<string, unknown>) ?? {},
		result: row.result as AuditEntry["result"],
		durationMs: row.durationMs,
		tokensCost: row.tokensCost ?? undefined,
		timestamp: row.timestamp,
	};
}

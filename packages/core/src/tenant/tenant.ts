import { eq } from "drizzle-orm";
import { generateId } from "../crypto/web-crypto.js";
import type { Database } from "../db/database.js";
import { tenants } from "../db/schema.js";

export interface Tenant {
	id: string; // tnt_...
	name: string;
	slug: string; // URL-safe identifier
	settings: TenantSettings;
	status: "active" | "suspended";
	createdAt: Date;
	updatedAt: Date;
}

export interface TenantSettings {
	maxAgents?: number; // override global default
	maxDelegationDepth?: number;
	auditRetentionDays?: number;
	allowedAgentTypes?: string[];
}

export interface CreateTenantInput {
	name: string;
	slug: string;
	settings?: Partial<TenantSettings>;
}

function slugRegex(): RegExp {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
}

function rowToTenant(row: {
	id: string;
	name: string;
	slug: string;
	settings: unknown;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}): Tenant {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		settings: (row.settings as TenantSettings) ?? {},
		status: row.status as Tenant["status"],
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function createTenantModule(db: Database) {
	async function create(input: CreateTenantInput): Promise<Tenant> {
		if (!slugRegex().test(input.slug)) {
			throw new Error(
				`Invalid slug "${input.slug}". Use lowercase letters, numbers, and hyphens only.`,
			);
		}

		const existing = await db.select().from(tenants).where(eq(tenants.slug, input.slug)).limit(1);

		if (existing.length > 0) {
			throw new Error(`Tenant with slug "${input.slug}" already exists.`);
		}

		const id = `tnt_${generateId().replace(/-/g, "")}`;
		const now = new Date();
		const settings: TenantSettings = input.settings ?? {};

		await db.insert(tenants).values({
			id,
			name: input.name,
			slug: input.slug,
			settings,
			status: "active",
			createdAt: now,
			updatedAt: now,
		});

		return {
			id,
			name: input.name,
			slug: input.slug,
			settings,
			status: "active",
			createdAt: now,
			updatedAt: now,
		};
	}

	async function get(tenantId: string): Promise<Tenant | null> {
		const rows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
		const row = rows[0];
		if (!row) return null;
		return rowToTenant(row);
	}

	async function getBySlug(slug: string): Promise<Tenant | null> {
		const rows = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
		const row = rows[0];
		if (!row) return null;
		return rowToTenant(row);
	}

	async function list(): Promise<Tenant[]> {
		const rows = await db.select().from(tenants);
		return rows.map(rowToTenant);
	}

	async function update(tenantId: string, updates: Partial<CreateTenantInput>): Promise<Tenant> {
		const existing = await get(tenantId);
		if (!existing) throw new Error(`Tenant "${tenantId}" not found.`);

		if (updates.slug !== undefined && updates.slug !== existing.slug) {
			if (!slugRegex().test(updates.slug)) {
				throw new Error(
					`Invalid slug "${updates.slug}". Use lowercase letters, numbers, and hyphens only.`,
				);
			}
			const conflict = await db
				.select()
				.from(tenants)
				.where(eq(tenants.slug, updates.slug))
				.limit(1);
			if (conflict.length > 0) {
				throw new Error(`Tenant with slug "${updates.slug}" already exists.`);
			}
		}

		const now = new Date();

		await db
			.update(tenants)
			.set({
				name: updates.name ?? existing.name,
				slug: updates.slug ?? existing.slug,
				settings: updates.settings
					? { ...existing.settings, ...updates.settings }
					: existing.settings,
				updatedAt: now,
			})
			.where(eq(tenants.id, tenantId));

		const updated = await get(tenantId);
		if (!updated) throw new Error(`Tenant "${tenantId}" disappeared after update.`);
		return updated;
	}

	async function suspend(tenantId: string): Promise<void> {
		const existing = await get(tenantId);
		if (!existing) throw new Error(`Tenant "${tenantId}" not found.`);

		await db
			.update(tenants)
			.set({ status: "suspended", updatedAt: new Date() })
			.where(eq(tenants.id, tenantId));
	}

	async function activate(tenantId: string): Promise<void> {
		const existing = await get(tenantId);
		if (!existing) throw new Error(`Tenant "${tenantId}" not found.`);

		await db
			.update(tenants)
			.set({ status: "active", updatedAt: new Date() })
			.where(eq(tenants.id, tenantId));
	}

	return { create, get, getBySlug, list, update, suspend, activate };
}

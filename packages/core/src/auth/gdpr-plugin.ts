/**
 * GDPR plugin for KavachOS.
 *
 * Exposes three self-service endpoints that authenticated users can call
 * to exercise their data rights under GDPR Articles 17 and 20.
 *
 * Endpoints:
 *   GET    /auth/gdpr/export     – download a JSON export of all personal data
 *   DELETE /auth/gdpr/delete     – permanently delete the account
 *   POST   /auth/gdpr/anonymize  – strip PII but keep the account shell
 *
 * @example
 * ```typescript
 * import { createKavach } from 'kavachos';
 * import { gdpr } from 'kavachos/auth';
 *
 * const kavach = await createKavach({
 *   database: { provider: 'sqlite', url: 'kavach.db' },
 *   plugins: [gdpr()],
 * });
 * ```
 */

import type { KavachPlugin } from "../plugin/types.js";
import { createGdprModule } from "./gdpr.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
	try {
		return (await request.json()) as Record<string, unknown>;
	} catch {
		return {};
	}
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function gdpr(): KavachPlugin {
	return {
		id: "kavach-gdpr",

		async init(ctx): Promise<undefined> {
			const module = createGdprModule(ctx.db);

			// GET /auth/gdpr/export
			// Returns a full JSON export of the authenticated user's data.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/gdpr/export",
				metadata: {
					requireAuth: true,
					description: "Export all personal data for the authenticated user (GDPR Art. 20)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					try {
						const data = await module.exportUserData(user.id);
						return jsonResponse(data);
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Export failed" },
							500,
						);
					}
				},
			});

			// DELETE /auth/gdpr/delete
			// Permanently deletes the authenticated user's account and all associated data.
			// Requires a confirmation body: { confirm: "delete my account" }
			ctx.addEndpoint({
				method: "DELETE",
				path: "/auth/gdpr/delete",
				metadata: {
					requireAuth: true,
					description: "Delete account and all personal data (GDPR Art. 17)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const body = await parseBody(request);

					// Require explicit confirmation to prevent accidental deletion
					if (body.confirm !== "delete my account") {
						return jsonResponse(
							{
								error:
									'Confirmation required. Send { "confirm": "delete my account" } in the request body.',
							},
							400,
						);
					}

					const keepAuditLogs = typeof body.keepAuditLogs === "boolean" ? body.keepAuditLogs : true;
					const deleteOrganizations =
						typeof body.deleteOrganizations === "boolean" ? body.deleteOrganizations : false;

					try {
						const result = await module.deleteUser(user.id, {
							keepAuditLogs,
							deleteOrganizations,
						});
						return jsonResponse({ success: true, ...result });
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Deletion failed" },
							500,
						);
					}
				},
			});

			// POST /auth/gdpr/anonymize
			// Replaces PII with anonymized values, keeping the account structure intact.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/gdpr/anonymize",
				metadata: {
					requireAuth: true,
					description: "Anonymize personal data while preserving account structure",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					try {
						await module.anonymizeUser(user.id);
						return jsonResponse({ success: true });
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Anonymization failed" },
							500,
						);
					}
				},
			});

			return undefined;
		},
	};
}

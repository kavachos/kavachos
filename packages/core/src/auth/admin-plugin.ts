import type { KavachPlugin } from "../plugin/types.js";
import { createSessionManager } from "../session/session.js";
import type { AdminConfig } from "./admin.js";
import { createAdminModule } from "./admin.js";

export type { AdminConfig };

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

export function admin(config?: AdminConfig): KavachPlugin {
	return {
		id: "kavach-admin",

		async init(ctx): Promise<undefined> {
			const sessionConfig = ctx.config.auth?.session;
			const sessionManager = sessionConfig ? createSessionManager(sessionConfig, ctx.db) : null;
			const module = createAdminModule(config ?? {}, ctx.db, sessionManager);

			// GET /auth/admin/users
			// Lists all users. Requires admin.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/admin/users",
				metadata: {
					requireAuth: true,
					description: "List all users (admin only)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const isAdminUser = await module.isAdmin(user.id);
					if (!isAdminUser) {
						return jsonResponse({ error: "Admin access required" }, 403);
					}

					const url = new URL(request.url);
					const limitParam = url.searchParams.get("limit");
					const offsetParam = url.searchParams.get("offset");
					const search = url.searchParams.get("search") ?? undefined;

					const result = await module.listUsers({
						limit: limitParam ? Number(limitParam) : undefined,
						offset: offsetParam ? Number(offsetParam) : undefined,
						search,
					});

					return jsonResponse(result);
				},
			});

			// GET /auth/admin/users/:id
			// Returns a single user by ID. Requires admin.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/admin/users/:id",
				metadata: {
					requireAuth: true,
					description: "Get a user by ID (admin only)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const isAdminUser = await module.isAdmin(user.id);
					if (!isAdminUser) {
						return jsonResponse({ error: "Admin access required" }, 403);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "admin", "users", "<id>"]
					const targetId = segments[3];

					if (!targetId) {
						return jsonResponse({ error: "Missing user ID in path" }, 400);
					}

					const found = await module.getUser(decodeURIComponent(targetId));
					if (!found) {
						return jsonResponse({ error: "User not found" }, 404);
					}

					return jsonResponse(found);
				},
			});

			// POST /auth/admin/users/:id/ban
			// Bans a user. Optionally accepts { reason, expiresAt } in body. Requires admin.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/admin/users/:id/ban",
				metadata: {
					requireAuth: true,
					description: "Ban a user (admin only)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const isAdminUser = await module.isAdmin(user.id);
					if (!isAdminUser) {
						return jsonResponse({ error: "Admin access required" }, 403);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "admin", "users", "<id>", "ban"]
					const targetId = segments[3];

					if (!targetId) {
						return jsonResponse({ error: "Missing user ID in path" }, 400);
					}

					const body = await parseBody(request);
					const reason = typeof body.reason === "string" ? body.reason : undefined;
					const expiresAt = body.expiresAt ? new Date(body.expiresAt as string) : undefined;

					await module.banUser(decodeURIComponent(targetId), reason, expiresAt);
					return jsonResponse({ success: true });
				},
			});

			// POST /auth/admin/users/:id/unban
			// Lifts a ban from a user. Requires admin.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/admin/users/:id/unban",
				metadata: {
					requireAuth: true,
					description: "Unban a user (admin only)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const isAdminUser = await module.isAdmin(user.id);
					if (!isAdminUser) {
						return jsonResponse({ error: "Admin access required" }, 403);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "admin", "users", "<id>", "unban"]
					const targetId = segments[3];

					if (!targetId) {
						return jsonResponse({ error: "Missing user ID in path" }, 400);
					}

					await module.unbanUser(decodeURIComponent(targetId));
					return jsonResponse({ success: true });
				},
			});

			// DELETE /auth/admin/users/:id
			// Permanently deletes a user. Requires admin.
			ctx.addEndpoint({
				method: "DELETE",
				path: "/auth/admin/users/:id",
				metadata: {
					requireAuth: true,
					description: "Delete a user (admin only)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const isAdminUser = await module.isAdmin(user.id);
					if (!isAdminUser) {
						return jsonResponse({ error: "Admin access required" }, 403);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "admin", "users", "<id>"]
					const targetId = segments[3];

					if (!targetId) {
						return jsonResponse({ error: "Missing user ID in path" }, 400);
					}

					await module.deleteUser(decodeURIComponent(targetId));
					return jsonResponse({ success: true });
				},
			});

			// POST /auth/admin/users/:id/impersonate
			// Starts an impersonation session as the target user. Requires admin.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/admin/users/:id/impersonate",
				metadata: {
					requireAuth: true,
					description: "Start an impersonation session as a target user (admin only)",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const isAdminUser = await module.isAdmin(user.id);
					if (!isAdminUser) {
						return jsonResponse({ error: "Admin access required" }, 403);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "admin", "users", "<id>", "impersonate"]
					const targetId = segments[3];

					if (!targetId) {
						return jsonResponse({ error: "Missing user ID in path" }, 400);
					}

					try {
						const result = await module.impersonate(user.id, decodeURIComponent(targetId));
						return jsonResponse(result);
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Impersonation failed" },
							403,
						);
					}
				},
			});
		},
	};
}

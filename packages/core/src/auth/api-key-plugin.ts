import type { KavachPlugin } from "../plugin/types.js";
import type { ApiKeyManagerConfig } from "./api-key-manager.js";
import { createApiKeyManagerModule } from "./api-key-manager.js";

export type { ApiKeyManagerConfig };

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

export function apiKeys(config?: ApiKeyManagerConfig): KavachPlugin {
	return {
		id: "kavach-api-key",

		async init(ctx): Promise<undefined> {
			const module = createApiKeyManagerModule(config ?? {}, ctx.db);

			// POST /auth/api-keys
			// Creates a new API key for the authenticated user. Returns the full
			// key once — it is never stored in plaintext and cannot be retrieved again.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/api-keys",
				metadata: {
					requireAuth: true,
					description: "Create a new API key for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const body = await parseBody(request);
					const name = typeof body.name === "string" ? body.name.trim() : null;
					const permissions = Array.isArray(body.permissions) ? body.permissions : null;

					if (!name || !permissions) {
						return jsonResponse({ error: "Missing required fields: name, permissions" }, 400);
					}

					const expiresAt = body.expiresAt ? new Date(body.expiresAt as string) : undefined;

					try {
						const result = await module.create({
							userId: user.id,
							name,
							permissions: permissions as string[],
							expiresAt,
						});
						return jsonResponse(result, 201);
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Failed to create API key" },
							500,
						);
					}
				},
			});

			// GET /auth/api-keys
			// Lists all API keys for the authenticated user (hashes and prefixes only —
			// full keys are never returned after creation).
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/api-keys",
				metadata: {
					requireAuth: true,
					description: "List API keys for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const keys = await module.list(user.id);
					return jsonResponse({ apiKeys: keys });
				},
			});

			// DELETE /auth/api-keys/:id
			// Revokes an API key. The key must belong to the authenticated user.
			ctx.addEndpoint({
				method: "DELETE",
				path: "/auth/api-keys/:id",
				metadata: {
					requireAuth: true,
					description: "Revoke an API key for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "api-keys", "<id>"]
					const keyId = segments[2];

					if (!keyId) {
						return jsonResponse({ error: "Missing API key ID in path" }, 400);
					}

					// Confirm ownership before revoking.
					const keys = await module.list(user.id);
					const owned = keys.some((k) => k.id === decodeURIComponent(keyId));
					if (!owned) {
						return jsonResponse({ error: "API key not found" }, 404);
					}

					await module.revoke(decodeURIComponent(keyId));
					return jsonResponse({ revoked: true });
				},
			});

			// POST /auth/api-keys/:id/rotate
			// Revokes the existing key and issues a new one with identical settings.
			// Returns the new key once — the same one-time-display rule applies.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/api-keys/:id/rotate",
				metadata: {
					requireAuth: true,
					description: "Rotate an API key — revokes the old one and returns a new key",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const url = new URL(request.url);
					const segments = url.pathname.split("/").filter(Boolean);
					// Expected: ["auth", "api-keys", "<id>", "rotate"]
					const keyId = segments[2];

					if (!keyId) {
						return jsonResponse({ error: "Missing API key ID in path" }, 400);
					}

					// Confirm ownership before rotating.
					const keys = await module.list(user.id);
					const owned = keys.some((k) => k.id === decodeURIComponent(keyId));
					if (!owned) {
						return jsonResponse({ error: "API key not found" }, 404);
					}

					try {
						const result = await module.rotate(decodeURIComponent(keyId));
						return jsonResponse(result);
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Failed to rotate API key" },
							400,
						);
					}
				},
			});
		},
	};
}

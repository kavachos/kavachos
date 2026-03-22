import type { KavachPlugin } from "../plugin/types.js";
import { createSessionManager } from "../session/session.js";
import type { AnonymousAuthConfig } from "./anonymous.js";
import { createAnonymousAuthModule } from "./anonymous.js";

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

export function anonymousAuth(config?: AnonymousAuthConfig): KavachPlugin {
	return {
		id: "kavach-anonymous",

		async init(ctx): Promise<undefined> {
			const sessionSecret = (
				ctx.config as unknown as {
					auth?: { session?: { secret?: string } };
				}
			).auth?.session?.secret;

			if (!sessionSecret) {
				throw new Error("anonymousAuth plugin requires auth.session.secret to be configured");
			}

			const sessionManager = createSessionManager({ secret: sessionSecret }, ctx.db);
			const mod = createAnonymousAuthModule(config ?? {}, ctx.db, sessionManager);

			// POST /auth/anonymous
			// Creates a new anonymous user and returns a session token.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/anonymous",
				metadata: {
					description: "Create an anonymous guest user and return a session token",
					rateLimit: { window: 60_000, max: 20 },
				},
				async handler(_request, _endpointCtx) {
					try {
						const result = await mod.createAnonymousUser();
						return jsonResponse({ userId: result.userId, sessionToken: result.sessionToken });
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Failed to create anonymous user" },
							500,
						);
					}
				},
			});

			// POST /auth/anonymous/upgrade
			// Upgrades the current anonymous user to a real account.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/anonymous/upgrade",
				metadata: {
					requireAuth: true,
					description: "Upgrade an anonymous account to a real account by setting email",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const body = await parseBody(request);
					const email = typeof body.email === "string" ? body.email.trim() : null;
					const name = typeof body.name === "string" ? body.name.trim() : undefined;

					if (!email) {
						return jsonResponse({ error: "Missing required field: email" }, 400);
					}

					try {
						await mod.upgradeUser(user.id, { email, name });
						return jsonResponse({ upgraded: true });
					} catch (err) {
						const message = err instanceof Error ? err.message : "Upgrade failed";
						const status = message.includes("not an anonymous user") ? 400 : 500;
						return jsonResponse({ error: message }, status);
					}
				},
			});

			// GET /auth/anonymous/status
			// Returns whether the current user is anonymous.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/anonymous/status",
				metadata: {
					requireAuth: true,
					description: "Check if the authenticated user is an anonymous guest",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return jsonResponse({ error: "Authentication required" }, 401);
					}

					const anonymous = await mod.isAnonymous(user.id);
					return jsonResponse({ anonymous });
				},
			});
		},
	};
}

import type { KavachPlugin } from "../plugin/types.js";
import { createSessionManager } from "../session/session.js";
import type { MagicLinkConfig } from "./magic-link.js";
import { createMagicLinkModule } from "./magic-link.js";
import { withRateLimit } from "./rate-limit-middleware.js";
import { createRateLimiter } from "./rate-limiter.js";

// Re-export the config type so callers can import from this file.
export type { MagicLinkConfig };

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function magicLink(config: MagicLinkConfig): KavachPlugin {
	return {
		id: "kavach-magic-link",

		async init(ctx): Promise<undefined> {
			const sessionConfig = ctx.config.auth?.session;
			if (!sessionConfig) {
				throw new Error(
					"kavach-magic-link plugin requires auth.session to be configured so that sessions can be issued on successful verification.",
				);
			}

			const sessionManager = createSessionManager(sessionConfig, ctx.db);
			const module = createMagicLinkModule(config, ctx.db, sessionManager);

			const sendLimiter = createRateLimiter({ max: 5, window: 60 });

			// POST /auth/magic-link/send
			// Accepts { email: string } and sends a magic link to that address.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/magic-link/send",
				metadata: {
					rateLimit: { window: 60, max: 5 },
					description: "Send a magic link to the provided email address",
				},
				handler: withRateLimit(async (request) => {
					let body: unknown;
					try {
						body = await request.json();
					} catch {
						return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					const b = body as Record<string, unknown>;
					const rawEmail = typeof b.email === "string" ? b.email.trim().toLowerCase() : null;

					if (!rawEmail) {
						return new Response(JSON.stringify({ error: "Missing required field: email" }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					try {
						const result = await module.sendLink(rawEmail);
						return new Response(JSON.stringify(result), {
							status: 200,
							headers: { "Content-Type": "application/json" },
						});
					} catch (err) {
						return new Response(
							JSON.stringify({
								error: err instanceof Error ? err.message : "Failed to send magic link",
							}),
							{ status: 500, headers: { "Content-Type": "application/json" } },
						);
					}
				}, sendLimiter),
			});

			// GET /auth/magic-link/verify
			// Accepts ?token=<token> and returns user + session on success.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/magic-link/verify",
				metadata: {
					description: "Verify a magic link token and return a session",
				},
				async handler(request) {
					const url = new URL(request.url);
					const token = url.searchParams.get("token");

					if (!token) {
						return new Response(JSON.stringify({ error: "Missing token query parameter" }), {
							status: 400,
							headers: { "Content-Type": "application/json" },
						});
					}

					const result = await module.verify(token);

					if (!result) {
						return new Response(JSON.stringify({ error: "Invalid or expired magic link" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					return new Response(JSON.stringify(result), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				},
			});
		},
	};
}

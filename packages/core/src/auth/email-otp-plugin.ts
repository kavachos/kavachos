import type { KavachPlugin } from "../plugin/types.js";
import { createSessionManager } from "../session/session.js";
import type { EmailOtpConfig } from "./email-otp.js";
import { createEmailOtpModule } from "./email-otp.js";

export type { EmailOtpConfig };

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

export function emailOtp(config: EmailOtpConfig): KavachPlugin {
	return {
		id: "kavach-email-otp",

		async init(ctx): Promise<undefined> {
			const sessionConfig = ctx.config.auth?.session;
			if (!sessionConfig) {
				throw new Error(
					"kavach-email-otp plugin requires auth.session to be configured so that sessions can be issued on successful verification.",
				);
			}

			const sessionManager = createSessionManager(sessionConfig, ctx.db);
			const module = createEmailOtpModule(config, ctx.db, sessionManager);

			// POST /auth/email-otp/send
			// Accepts { email: string } and sends an OTP code to that address.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/email-otp/send",
				metadata: {
					rateLimit: { window: 60, max: 5 },
					description: "Send a one-time passcode to the provided email address",
				},
				async handler(request) {
					const body = await parseBody(request);
					const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

					if (!rawEmail) {
						return jsonResponse({ error: "Missing required field: email" }, 400);
					}

					try {
						const result = await module.sendCode(rawEmail);
						return jsonResponse(result);
					} catch (err) {
						return jsonResponse(
							{ error: err instanceof Error ? err.message : "Failed to send OTP" },
							500,
						);
					}
				},
			});

			// POST /auth/email-otp/verify
			// Accepts { email: string; code: string } and returns user + session on success.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/email-otp/verify",
				metadata: {
					rateLimit: { window: 60, max: 10 },
					description: "Verify an OTP code and return a session on success",
				},
				async handler(request) {
					const body = await parseBody(request);
					const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
					const code = typeof body.code === "string" ? body.code.trim() : null;

					if (!rawEmail || !code) {
						return jsonResponse({ error: "Missing required fields: email, code" }, 400);
					}

					const result = await module.verifyCode(rawEmail, code);

					if (!result) {
						return jsonResponse({ error: "Invalid or expired OTP code" }, 401);
					}

					return jsonResponse(result);
				},
			});
		},
	};
}

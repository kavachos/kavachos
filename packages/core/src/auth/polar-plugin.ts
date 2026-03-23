import type { KavachPlugin } from "../plugin/types.js";
import type { PolarConfig } from "./polar.js";
import { createPolarModule } from "./polar.js";

export type { PolarConfig };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(body: unknown, status = 200): Response {
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

export function polar(config: PolarConfig): KavachPlugin {
	return {
		id: "kavach-polar",

		async init(ctx): Promise<undefined> {
			const module = createPolarModule(config, ctx.db);

			// POST /auth/polar/checkout
			// Creates a Polar checkout session for the authenticated user.
			// Body: { productId: string, successUrl?: string, customerEmail?: string }
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/polar/checkout",
				metadata: {
					requireAuth: true,
					description: "Create a Polar checkout session for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return json({ error: "Authentication required" }, 401);
					}

					const body = await parseBody(request);
					const productId = typeof body.productId === "string" ? body.productId.trim() : null;
					if (!productId) {
						return json({ error: "Missing required field: productId" }, 400);
					}

					const successUrl = typeof body.successUrl === "string" ? body.successUrl : undefined;
					const customerEmail =
						typeof body.customerEmail === "string" ? body.customerEmail : undefined;

					try {
						const result = await module.createCheckout(user.id, productId, {
							successUrl,
							customerEmail,
						});
						return json(result);
					} catch (err) {
						return json(
							{
								error: err instanceof Error ? err.message : "Failed to create checkout session",
							},
							500,
						);
					}
				},
			});

			// GET /auth/polar/subscription
			// Returns the current subscription status for the authenticated user.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/polar/subscription",
				metadata: {
					requireAuth: true,
					description: "Get the current Polar subscription status for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return json({ error: "Authentication required" }, 401);
					}

					const subscription = await module.getSubscription(user.id);
					return json({ subscription });
				},
			});

			// POST /auth/polar/webhook
			// Receives Polar webhook events. No session auth — verified by HMAC-SHA256 signature.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/polar/webhook",
				metadata: {
					description: "Handle Polar webhook events (HMAC-SHA256 signature verified)",
				},
				async handler(request) {
					return module.handleWebhook(request);
				},
			});
		},
	};
}

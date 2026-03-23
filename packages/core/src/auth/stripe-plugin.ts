import type { KavachPlugin } from "../plugin/types.js";
import type { StripeConfig } from "./stripe.js";
import { createStripeModule } from "./stripe.js";

export type { StripeConfig };

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

export function stripe(config: StripeConfig): KavachPlugin {
	return {
		id: "kavach-stripe",

		async init(ctx): Promise<undefined> {
			const module = createStripeModule(config, ctx.db);

			// POST /auth/stripe/checkout
			// Creates a Stripe Checkout Session for the authenticated user.
			// Body: { priceId: string, successUrl?: string, cancelUrl?: string,
			//         trialDays?: number, metadata?: Record<string, string> }
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/stripe/checkout",
				metadata: {
					requireAuth: true,
					description: "Create a Stripe Checkout Session for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return json({ error: "Authentication required" }, 401);
					}

					const body = await parseBody(request);
					const priceId = typeof body.priceId === "string" ? body.priceId.trim() : null;
					if (!priceId) {
						return json({ error: "Missing required field: priceId" }, 400);
					}

					const successUrl = typeof body.successUrl === "string" ? body.successUrl : undefined;
					const cancelUrl = typeof body.cancelUrl === "string" ? body.cancelUrl : undefined;
					const trialDays = typeof body.trialDays === "number" ? body.trialDays : undefined;
					const metadata =
						body.metadata != null &&
						typeof body.metadata === "object" &&
						!Array.isArray(body.metadata)
							? (body.metadata as Record<string, string>)
							: undefined;

					try {
						const result = await module.createCheckoutSession(user.id, priceId, {
							successUrl,
							cancelUrl,
							trialDays,
							metadata,
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

			// POST /auth/stripe/portal
			// Creates a Stripe Billing Portal session for the authenticated user.
			// Body: { returnUrl: string }
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/stripe/portal",
				metadata: {
					requireAuth: true,
					description: "Create a Stripe Billing Portal session for the authenticated user",
				},
				async handler(request, endpointCtx) {
					const user = await endpointCtx.getUser(request);
					if (!user) {
						return json({ error: "Authentication required" }, 401);
					}

					const body = await parseBody(request);
					const returnUrl = typeof body.returnUrl === "string" ? body.returnUrl.trim() : null;
					if (!returnUrl) {
						return json({ error: "Missing required field: returnUrl" }, 400);
					}

					try {
						const result = await module.createPortalSession(user.id, returnUrl);
						return json(result);
					} catch (err) {
						return json(
							{
								error: err instanceof Error ? err.message : "Failed to create portal session",
							},
							500,
						);
					}
				},
			});

			// GET /auth/stripe/subscription
			// Returns the current subscription status for the authenticated user.
			ctx.addEndpoint({
				method: "GET",
				path: "/auth/stripe/subscription",
				metadata: {
					requireAuth: true,
					description: "Get the current subscription status for the authenticated user",
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

			// POST /auth/stripe/webhook
			// Receives Stripe webhook events. No session auth — verified by HMAC signature.
			ctx.addEndpoint({
				method: "POST",
				path: "/auth/stripe/webhook",
				metadata: {
					description: "Handle Stripe webhook events (HMAC-SHA256 signature verified)",
				},
				async handler(request) {
					return module.handleWebhook(request);
				},
			});
		},
	};
}

/**
 * Higher-order function that wraps a plugin endpoint handler with IP-based
 * rate limiting. When the limit is exceeded it responds with 429 and a
 * Retry-After header before the wrapped handler is ever called.
 */

import type { PluginEndpoint } from "../plugin/types.js";
import type { RateLimiter } from "./rate-limiter.js";

export interface RateLimitMiddlewareOptions {
	/**
	 * Derive the rate-limit key from the incoming request.
	 *
	 * Defaults to the first non-empty value of:
	 *   x-forwarded-for → first IP in the comma-separated list
	 *   x-real-ip
	 *   "unknown"
	 */
	keyExtractor?: (request: Request) => string;
}

function defaultKeyExtractor(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = (forwarded.split(",")[0] ?? "").trim();
		if (first) return first;
	}
	const real = request.headers.get("x-real-ip");
	if (real) return real.trim();
	return "unknown";
}

export function withRateLimit(
	handler: PluginEndpoint["handler"],
	limiter: RateLimiter,
	options?: RateLimitMiddlewareOptions,
): PluginEndpoint["handler"] {
	const extractKey = options?.keyExtractor ?? defaultKeyExtractor;

	return async function rateLimitedHandler(request, ctx) {
		const key = extractKey(request);
		const result = limiter.check(key);

		if (!result.allowed) {
			const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
			return new Response(
				JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests" } }),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": String(Math.max(retryAfter, 1)),
					},
				},
			);
		}

		return handler(request, ctx);
	};
}

import type { RateLimitConfig, RateLimitEntry } from "./types.js";

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: Date;
}

/**
 * In-memory sliding window rate limiter keyed by agent ID or IP address.
 * Creates one store per distinct config so global and per-policy limits
 * are tracked independently.
 */
export function createGatewayRateLimiter(config: RateLimitConfig) {
	const { windowMs, max } = config;
	const store = new Map<string, RateLimitEntry>();

	function prune(timestamps: number[], now: number): number[] {
		const cutoff = now - windowMs;
		let i = 0;
		while (i < timestamps.length && (timestamps[i] ?? Infinity) <= cutoff) {
			i++;
		}
		return i === 0 ? timestamps : timestamps.slice(i);
	}

	return {
		check(key: string): RateLimitResult {
			const now = Date.now();
			const raw = store.get(key) ?? { timestamps: [] };
			const timestamps = prune(raw.timestamps, now);

			if (timestamps.length >= max) {
				const oldest = timestamps[0] ?? now;
				const resetAt = new Date(oldest + windowMs);
				store.set(key, { timestamps });
				return { allowed: false, remaining: 0, resetAt };
			}

			timestamps.push(now);
			store.set(key, { timestamps });
			const remaining = max - timestamps.length;
			const oldest = timestamps[0] ?? now;
			const resetAt = new Date(oldest + windowMs);
			return { allowed: true, remaining, resetAt };
		},

		reset(key: string): void {
			store.delete(key);
		},
	};
}

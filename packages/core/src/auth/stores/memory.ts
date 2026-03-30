/**
 * In-memory rate limit store.
 *
 * Uses a Map keyed by a caller-supplied string. Each entry tracks the current
 * hit count and the unix timestamp (ms) at which the window resets. Expired
 * windows are reset on the next increment so memory stays bounded without
 * needing a background sweep.
 */

import type { RateLimitStore } from "./types.js";

interface Entry {
	count: number;
	resetAt: number;
}

export class MemoryStore implements RateLimitStore {
	private readonly entries = new Map<string, Entry>();

	async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
		const now = Date.now();
		const existing = this.entries.get(key);

		if (!existing || existing.resetAt <= now) {
			// New window
			const resetAt = now + windowMs;
			this.entries.set(key, { count: 1, resetAt });
			return { count: 1, resetAt };
		}

		existing.count += 1;
		return { count: existing.count, resetAt: existing.resetAt };
	}

	async reset(key: string): Promise<void> {
		this.entries.delete(key);
	}
}

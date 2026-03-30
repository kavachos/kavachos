/**
 * Cloudflare KV rate limit store.
 *
 * Each key stores a JSON object { count, resetAt } with a TTL so Cloudflare
 * automatically evicts expired windows without any extra cleanup logic.
 *
 * The KV namespace is passed in at construction time so this module remains
 * free of any Cloudflare-specific imports (it only uses the KV interface that
 * Workers expose at runtime).
 */

import type { RateLimitStore } from "./types.js";

/** Minimal KV namespace interface — compatible with Cloudflare Workers KVNamespace */
export interface KVNamespace {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
	delete(key: string): Promise<void>;
}

interface KVEntry {
	count: number;
	resetAt: number;
}

export class KVStore implements RateLimitStore {
	private readonly kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
		const now = Date.now();
		const raw = await this.kv.get(key);

		if (raw !== null) {
			let entry: KVEntry;
			try {
				entry = JSON.parse(raw) as KVEntry;
			} catch {
				entry = { count: 0, resetAt: now + windowMs };
			}

			if (entry.resetAt > now) {
				// Still in the same window — increment
				entry.count += 1;
				const ttlSeconds = Math.ceil((entry.resetAt - now) / 1000);
				await this.kv.put(key, JSON.stringify(entry), { expirationTtl: Math.max(ttlSeconds, 1) });
				return { count: entry.count, resetAt: entry.resetAt };
			}
		}

		// New window
		const resetAt = now + windowMs;
		const entry: KVEntry = { count: 1, resetAt };
		const ttlSeconds = Math.ceil(windowMs / 1000);
		await this.kv.put(key, JSON.stringify(entry), { expirationTtl: Math.max(ttlSeconds, 1) });
		return { count: 1, resetAt };
	}

	async reset(key: string): Promise<void> {
		await this.kv.delete(key);
	}
}

/** Factory function to create a KVStore from a KV namespace binding */
export function kvStore(kv: KVNamespace): KVStore {
	return new KVStore(kv);
}

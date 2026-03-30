import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function deliverNoCrypto(fetchFn: () => Promise<Response>): Promise<string[]> {
	const results: string[] = [];
	// Simulate an async op (not crypto.subtle) before the loop
	await Promise.resolve(); // just a resolved promise
	for (let i = 0; i < 2; i++) {
		if (i > 0) {
			await new Promise<void>((resolve) => setTimeout(resolve, 1000));
		}
		const controller = new AbortController();
		const tid = setTimeout(() => controller.abort(), 5000);
		try {
			const resp = await fetchFn();
			results.push(`${resp.status}`);
		} finally {
			clearTimeout(tid);
		}
	}
	return results;
}

async function deliverWithCrypto(fetchFn: () => Promise<Response>): Promise<string[]> {
	const results: string[] = [];
	// crypto.subtle before the loop
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode("secret"),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const _sig = await crypto.subtle.sign("HMAC", key, enc.encode("message"));
	for (let i = 0; i < 2; i++) {
		if (i > 0) {
			await new Promise<void>((resolve) => setTimeout(resolve, 1000));
		}
		const controller = new AbortController();
		const tid = setTimeout(() => controller.abort(), 5000);
		try {
			const resp = await fetchFn();
			results.push(`${resp.status}`);
		} finally {
			clearTimeout(tid);
		}
	}
	return results;
}

describe("fake timer test - diagnose", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("works with Promise.resolve() before loop", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response(null, { status: 500 }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const promise = deliverNoCrypto(() => fetchMock());
		await vi.runAllTimersAsync();
		const results = await promise;

		expect(results).toEqual(["500", "200"]);
	});

	it("works with crypto.subtle before loop", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response(null, { status: 500 }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const promise = deliverWithCrypto(() => fetchMock());
		await vi.runAllTimersAsync();
		const results = await promise;

		expect(results).toEqual(["500", "200"]);
	});
});

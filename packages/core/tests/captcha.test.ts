/**
 * Tests for captcha integration.
 *
 * All external HTTP calls are mocked via vi.stubGlobal on fetch.
 *
 * Covers:
 * - verify: returns success true when provider responds with { success: true }
 * - verify: returns success false when provider responds with { success: false }
 * - verify: returns success false when token is empty
 * - verify: returns success false on network error
 * - verify: passes remoteip when ip argument is provided
 * - verify: rejects reCAPTCHA v3 score below minScore
 * - verify: accepts reCAPTCHA v3 score above minScore with score in result
 * - middleware: returns valid true when token header present and verify succeeds
 * - middleware: returns valid false when X-Captcha-Token header is missing
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CaptchaModule } from "../src/auth/captcha.js";
import { createCaptchaModule } from "../src/auth/captcha.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(data: Record<string, unknown>) {
	return vi.fn().mockResolvedValue({
		ok: true,
		json: async () => data,
	});
}

function mockFetchFail() {
	return vi.fn().mockRejectedValue(new Error("Network error"));
}

function mockFetchHttpError(status: number) {
	return vi.fn().mockResolvedValue({
		ok: false,
		status,
		json: async () => ({}),
	});
}

describe("CaptchaModule (turnstile)", () => {
	let mod: CaptchaModule;
	let originalFetch: typeof globalThis.fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		mod = createCaptchaModule({
			provider: "turnstile",
			secretKey: "test-secret",
		});
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns success true when provider responds with { success: true }", async () => {
		globalThis.fetch = mockFetchSuccess({ success: true });
		const result = await mod.verify("valid-token");
		expect(result.success).toBe(true);
	});

	it("returns success false when provider responds with { success: false }", async () => {
		globalThis.fetch = mockFetchSuccess({
			success: false,
			"error-codes": ["invalid-input-response"],
		});
		const result = await mod.verify("bad-token");
		expect(result.success).toBe(false);
		expect(result.error).toContain("invalid-input-response");
	});

	it("returns success false when token is empty", async () => {
		globalThis.fetch = mockFetchSuccess({ success: true });
		const result = await mod.verify("");
		expect(result.success).toBe(false);
		expect(result.error).toContain("Missing captcha token");
	});

	it("returns success false on network error", async () => {
		globalThis.fetch = mockFetchFail();
		const result = await mod.verify("some-token");
		expect(result.success).toBe(false);
		expect(result.error).toContain("Network error");
	});

	it("returns success false when provider returns non-2xx HTTP status", async () => {
		globalThis.fetch = mockFetchHttpError(500);
		const result = await mod.verify("some-token");
		expect(result.success).toBe(false);
		expect(result.error).toContain("500");
	});

	it("passes remoteip when ip argument is provided", async () => {
		const fetchMock = mockFetchSuccess({ success: true });
		globalThis.fetch = fetchMock;
		await mod.verify("token", "1.2.3.4");
		const callArgs = fetchMock.mock.calls[0] as [string, RequestInit];
		const body = callArgs[1].body as string;
		expect(body).toContain("remoteip=1.2.3.4");
	});
});

describe("CaptchaModule (recaptcha v3 scoring)", () => {
	let originalFetch: typeof globalThis.fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("rejects when score is below minScore", async () => {
		globalThis.fetch = mockFetchSuccess({ success: true, score: 0.3 });
		const mod = createCaptchaModule({
			provider: "recaptcha",
			secretKey: "secret",
			minScore: 0.5,
		});
		const result = await mod.verify("token");
		expect(result.success).toBe(false);
		expect(result.score).toBe(0.3);
		expect(result.error).toContain("below minimum");
	});

	it("accepts when score is above minScore and includes score in result", async () => {
		globalThis.fetch = mockFetchSuccess({ success: true, score: 0.8 });
		const mod = createCaptchaModule({
			provider: "recaptcha",
			secretKey: "secret",
			minScore: 0.5,
		});
		const result = await mod.verify("token");
		expect(result.success).toBe(true);
		expect(result.score).toBe(0.8);
	});
});

describe("CaptchaModule.middleware", () => {
	let originalFetch: typeof globalThis.fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns valid true when X-Captcha-Token header is present and valid", async () => {
		globalThis.fetch = mockFetchSuccess({ success: true });
		const mod = createCaptchaModule({ provider: "hcaptcha", secretKey: "secret" });
		const req = new Request("https://app.example.com/auth/sign-up", {
			method: "POST",
			headers: { "X-Captcha-Token": "valid-token" },
		});
		const result = await mod.middleware(req);
		expect(result.valid).toBe(true);
	});

	it("returns valid false when X-Captcha-Token header is missing", async () => {
		globalThis.fetch = mockFetchSuccess({ success: true });
		const mod = createCaptchaModule({ provider: "hcaptcha", secretKey: "secret" });
		const req = new Request("https://app.example.com/auth/sign-up", { method: "POST" });
		const result = await mod.middleware(req);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("X-Captcha-Token");
	});
});

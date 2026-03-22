/**
 * Tests for the human auth adapter system.
 *
 * Covers:
 * - headerAuth: extracts X-User-Id, falls back to custom header, returns null
 *   when header is absent or empty
 * - bearerAuth: validates HS256 JWT, extracts claims, rejects expired/invalid
 *   tokens, returns null when header is missing or not Bearer scheme
 * - customAuth: delegates to the provided resolver
 * - createKavach.resolveUser: returns null when no adapter is configured,
 *   delegates when an adapter is configured
 */

import { createSecretKey } from "node:crypto";
import { SignJWT } from "jose";
import { describe, expect, it, vi } from "vitest";
import { bearerAuth } from "../src/auth/adapters/bearer.js";
import { customAuth } from "../src/auth/adapters/custom.js";
import { headerAuth } from "../src/auth/adapters/header.js";
import { createKavach } from "../src/kavach.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_SECRET = "super-secret-key-at-least-32-chars-long!!";

function makeRequest(headers: Record<string, string>): Request {
	return new Request("https://example.com/api", { headers });
}

async function signJwt(
	payload: Record<string, unknown>,
	options?: {
		secret?: string;
		issuer?: string;
		audience?: string;
		expiresIn?: string;
	},
): Promise<string> {
	const secret = createSecretKey(Buffer.from(options?.secret ?? TEST_SECRET, "utf-8"));
	let builder = new SignJWT(payload).setProtectedHeader({ alg: "HS256" });

	if (options?.issuer) builder = builder.setIssuer(options.issuer);
	if (options?.audience) builder = builder.setAudience(options.audience);

	const expiry = options?.expiresIn ?? "1h";
	builder = builder.setExpirationTime(expiry);

	return builder.sign(secret);
}

// ---------------------------------------------------------------------------
// headerAuth
// ---------------------------------------------------------------------------

describe("headerAuth", () => {
	it("resolves user from default X-User-Id header", async () => {
		const adapter = headerAuth();
		const req = makeRequest({ "x-user-id": "user-abc" });
		const user = await adapter.resolveUser(req);
		expect(user).toEqual({ id: "user-abc" });
	});

	it("returns null when X-User-Id header is missing", async () => {
		const adapter = headerAuth();
		const req = makeRequest({});
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("returns null when X-User-Id header is empty string", async () => {
		const adapter = headerAuth();
		const req = makeRequest({ "x-user-id": "" });
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("returns null when header value is only whitespace", async () => {
		const adapter = headerAuth();
		const req = makeRequest({ "x-user-id": "   " });
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("trims whitespace from header value", async () => {
		const adapter = headerAuth();
		const req = makeRequest({ "x-user-id": "  user-123  " });
		const user = await adapter.resolveUser(req);
		expect(user).toEqual({ id: "user-123" });
	});

	it("uses a custom header name", async () => {
		const adapter = headerAuth({ header: "X-Authenticated-User" });
		const req = makeRequest({ "x-authenticated-user": "user-xyz" });
		const user = await adapter.resolveUser(req);
		expect(user).toEqual({ id: "user-xyz" });
	});

	it("returns null when custom header is missing", async () => {
		const adapter = headerAuth({ header: "X-Authenticated-User" });
		// Only the default header is present – should not be picked up
		const req = makeRequest({ "x-user-id": "user-abc" });
		expect(await adapter.resolveUser(req)).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// bearerAuth
// ---------------------------------------------------------------------------

describe("bearerAuth", () => {
	it("resolves user from a valid HS256 JWT", async () => {
		const token = await signJwt({ sub: "user-1", email: "alice@example.com", name: "Alice" });
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Bearer ${token}` });
		const user = await adapter.resolveUser(req);
		expect(user).toMatchObject({ id: "user-1", email: "alice@example.com", name: "Alice" });
	});

	it("maps `picture` claim to `image`", async () => {
		const token = await signJwt({ sub: "user-2", picture: "https://cdn.example.com/avatar.png" });
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Bearer ${token}` });
		const user = await adapter.resolveUser(req);
		expect(user?.image).toBe("https://cdn.example.com/avatar.png");
	});

	it("maps `image` claim to `image` when `picture` is absent", async () => {
		const token = await signJwt({ sub: "user-3", image: "https://cdn.example.com/me.png" });
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Bearer ${token}` });
		const user = await adapter.resolveUser(req);
		expect(user?.image).toBe("https://cdn.example.com/me.png");
	});

	it("includes unknown claims in `metadata`", async () => {
		const token = await signJwt({ sub: "user-4", role: "admin", org: "acme" });
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Bearer ${token}` });
		const user = await adapter.resolveUser(req);
		expect(user?.metadata).toMatchObject({ role: "admin", org: "acme" });
	});

	it("returns null when Authorization header is missing", async () => {
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({});
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("returns null when scheme is not Bearer", async () => {
		const token = await signJwt({ sub: "user-5" });
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Basic ${token}` });
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("returns null for an expired token", async () => {
		// expiresIn of -1s forces an already-expired token
		const token = await signJwt({ sub: "user-6" }, { expiresIn: "-1s" });
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Bearer ${token}` });
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("returns null for a token signed with the wrong secret", async () => {
		const token = await signJwt(
			{ sub: "user-7" },
			{ secret: "a-completely-different-secret-value" },
		);
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: `Bearer ${token}` });
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("returns null for a malformed token string", async () => {
		const adapter = bearerAuth({ secret: TEST_SECRET });
		const req = makeRequest({ authorization: "Bearer not.a.jwt" });
		expect(await adapter.resolveUser(req)).toBeNull();
	});

	it("validates issuer when configured", async () => {
		const token = await signJwt({ sub: "user-8" }, { issuer: "https://my-app.example.com" });
		const adapterOk = bearerAuth({ secret: TEST_SECRET, issuer: "https://my-app.example.com" });
		const adapterBad = bearerAuth({ secret: TEST_SECRET, issuer: "https://other.example.com" });

		const req = makeRequest({ authorization: `Bearer ${token}` });
		expect(await adapterOk.resolveUser(req)).not.toBeNull();
		expect(await adapterBad.resolveUser(req)).toBeNull();
	});

	it("validates audience when configured", async () => {
		const token = await signJwt({ sub: "user-9" }, { audience: "kavachos" });
		const adapterOk = bearerAuth({ secret: TEST_SECRET, audience: "kavachos" });
		const adapterBad = bearerAuth({ secret: TEST_SECRET, audience: "other-service" });

		const req = makeRequest({ authorization: `Bearer ${token}` });
		expect(await adapterOk.resolveUser(req)).not.toBeNull();
		expect(await adapterBad.resolveUser(req)).toBeNull();
	});

	it("throws when secret is empty", () => {
		expect(() => bearerAuth({ secret: "" })).toThrow();
	});
});

// ---------------------------------------------------------------------------
// customAuth
// ---------------------------------------------------------------------------

describe("customAuth", () => {
	it("calls the provided resolver and returns its result", async () => {
		const resolver = vi.fn().mockResolvedValue({ id: "user-custom", email: "custom@example.com" });
		const adapter = customAuth(resolver);
		const req = makeRequest({});
		const user = await adapter.resolveUser(req);
		expect(resolver).toHaveBeenCalledWith(req);
		expect(user).toEqual({ id: "user-custom", email: "custom@example.com" });
	});

	it("returns null when the resolver returns null", async () => {
		const adapter = customAuth(async () => null);
		expect(await adapter.resolveUser(makeRequest({}))).toBeNull();
	});

	it("propagates errors thrown by the resolver", async () => {
		const adapter = customAuth(async () => {
			throw new Error("auth provider unavailable");
		});
		await expect(adapter.resolveUser(makeRequest({}))).rejects.toThrow("auth provider unavailable");
	});
});

// ---------------------------------------------------------------------------
// createKavach.resolveUser integration
// ---------------------------------------------------------------------------

describe("createKavach.resolveUser", () => {
	it("returns null when no auth adapter is configured", async () => {
		const kavach = await createKavach({
			database: { provider: "sqlite", url: ":memory:" },
		});
		const user = await kavach.resolveUser(makeRequest({ "x-user-id": "user-abc" }));
		expect(user).toBeNull();
	});

	it("delegates to the configured adapter", async () => {
		const token = await signJwt({ sub: "user-integration", email: "int@example.com" });
		const kavach = await createKavach({
			database: { provider: "sqlite", url: ":memory:" },
			auth: { adapter: bearerAuth({ secret: TEST_SECRET }) },
		});
		const req = makeRequest({ authorization: `Bearer ${token}` });
		const user = await kavach.resolveUser(req);
		expect(user).toMatchObject({ id: "user-integration", email: "int@example.com" });
	});

	it("delegates to the configured adapter via kavach.auth.resolveUser", async () => {
		const token = await signJwt({ sub: "user-integration-2", email: "int2@example.com" });
		const kavach = await createKavach({
			database: { provider: "sqlite", url: ":memory:" },
			auth: { adapter: bearerAuth({ secret: TEST_SECRET }) },
		});
		const req = makeRequest({ authorization: `Bearer ${token}` });
		const user = await kavach.auth.resolveUser(req);
		expect(user).toMatchObject({ id: "user-integration-2", email: "int2@example.com" });
	});

	it("returns null when adapter finds no credential", async () => {
		const kavach = await createKavach({
			database: { provider: "sqlite", url: ":memory:" },
			auth: { adapter: headerAuth() },
		});
		// No X-User-Id header
		const user = await kavach.resolveUser(makeRequest({}));
		expect(user).toBeNull();
	});

	it("works with a customAuth adapter", async () => {
		const kavach = await createKavach({
			database: { provider: "sqlite", url: ":memory:" },
			auth: { adapter: customAuth(async () => ({ id: "user-custom", name: "Custom User" })) },
		});
		const user = await kavach.resolveUser(makeRequest({}));
		expect(user).toEqual({ id: "user-custom", name: "Custom User" });
	});
});

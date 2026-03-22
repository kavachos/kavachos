/**
 * Passkey / WebAuthn tests.
 *
 * Full end-to-end WebAuthn verification requires a real authenticator
 * (or a complex mock of webcrypto.subtle). These tests cover:
 *
 *   - CBOR decoder (used to parse attestation objects)
 *   - Registration option generation (challenge, rpId, excludeCredentials)
 *   - Authentication option generation (challenge, allowCredentials)
 *   - Credential listing and removal
 *   - Challenge expiry rejection
 *   - Route dispatch via handleRequest
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";
import { decodeCbor } from "../src/auth/cbor.js";
import { createPasskeyModule } from "../src/auth/passkey.js";
import { createTables } from "../src/db/migrations.js";
import * as schema from "../src/db/schema.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function makeDb() {
	const sqlite = new Database(":memory:");
	const db = drizzle(sqlite, { schema });
	await createTables(db, "sqlite");
	return db;
}

function makeConfig() {
	return {
		rpName: "Test App",
		rpId: "example.com",
		origin: "https://example.com",
		attestation: "none" as const,
		userVerification: "preferred" as const,
		challengeTimeout: 60_000,
	};
}

function toBase64Url(bytes: Uint8Array): string {
	const b64 = Buffer.from(bytes).toString("base64");
	return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function seedUser(db: ReturnType<typeof makeDb>, userId: string): Promise<void> {
	const now = new Date();
	await db.insert(schema.users).values({
		id: userId,
		email: `${userId}@test.example`,
		createdAt: now,
		updatedAt: now,
	});
}

// ---------------------------------------------------------------------------
// CBOR decoder tests
// ---------------------------------------------------------------------------

describe("decodeCbor", () => {
	it("decodes unsigned integers", () => {
		// CBOR for 0 = 0x00, 1 = 0x01, 23 = 0x17, 24 = 0x1818
		expect(decodeCbor(new Uint8Array([0x00]))).toBe(0);
		expect(decodeCbor(new Uint8Array([0x01]))).toBe(1);
		expect(decodeCbor(new Uint8Array([0x17]))).toBe(23);
		expect(decodeCbor(new Uint8Array([0x18, 0x18]))).toBe(24);
		expect(decodeCbor(new Uint8Array([0x18, 0xff]))).toBe(255);
	});

	it("decodes negative integers", () => {
		// Major type 1: -1 = 0x20, -2 = 0x21
		expect(decodeCbor(new Uint8Array([0x20]))).toBe(-1);
		expect(decodeCbor(new Uint8Array([0x21]))).toBe(-2);
		expect(decodeCbor(new Uint8Array([0x37]))).toBe(-24);
	});

	it("decodes byte strings", () => {
		// 0x42 = major type 2 (bytes), length 2, then 0xca 0xfe
		const result = decodeCbor(new Uint8Array([0x42, 0xca, 0xfe]));
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result as Uint8Array)).toEqual([0xca, 0xfe]);
	});

	it("decodes text strings", () => {
		// 0x63 = major type 3 (text), length 3, then "foo"
		const bytes = new Uint8Array([0x63, 0x66, 0x6f, 0x6f]);
		expect(decodeCbor(bytes)).toBe("foo");
	});

	it("decodes arrays", () => {
		// 0x83 = array of 3, elements 1, 2, 3
		const bytes = new Uint8Array([0x83, 0x01, 0x02, 0x03]);
		expect(decodeCbor(bytes)).toEqual([1, 2, 3]);
	});

	it("decodes maps with numeric keys", () => {
		// { 1: 2 } in CBOR: 0xa1 0x01 0x02
		const result = decodeCbor(new Uint8Array([0xa1, 0x01, 0x02]));
		expect(result).toBeInstanceOf(Map);
		expect((result as Map<unknown, unknown>).get(1)).toBe(2);
	});

	it("decodes boolean simple values", () => {
		expect(decodeCbor(new Uint8Array([0xf5]))).toBe(true);
		expect(decodeCbor(new Uint8Array([0xf4]))).toBe(false);
		expect(decodeCbor(new Uint8Array([0xf6]))).toBe(null);
	});

	it("decodes nested structures", () => {
		// Map { "fmt": "none" } — as produced by attestation objects
		// 0xa1 (map 1) 0x63 "fmt" 0x64 "none"
		const bytes = new Uint8Array([
			0xa1,
			0x63,
			0x66,
			0x6d,
			0x74, // "fmt"
			0x64,
			0x6e,
			0x6f,
			0x6e,
			0x65, // "none"
		]);
		const result = decodeCbor(bytes) as Map<unknown, unknown>;
		expect(result.get("fmt")).toBe("none");
	});
});

// ---------------------------------------------------------------------------
// Registration options tests
// ---------------------------------------------------------------------------

describe("getRegistrationOptions", () => {
	it("returns correct rpId and rpName", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getRegistrationOptions("user-1", "Alice");

		expect(opts.rp.id).toBe("example.com");
		expect(opts.rp.name).toBe("Test App");
	});

	it("includes a non-empty base64url challenge", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getRegistrationOptions("user-1", "Alice");

		expect(typeof opts.challenge).toBe("string");
		expect(opts.challenge.length).toBeGreaterThan(20);
		// base64url characters only
		expect(opts.challenge).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	it("sets timeout from config", async () => {
		const db = await makeDb();
		const config = { ...makeConfig(), challengeTimeout: 30_000 };
		const mod = createPasskeyModule(config, db);

		const opts = await mod.getRegistrationOptions("user-1", "Alice");
		expect(opts.timeout).toBe(30_000);
	});

	it("excludes existing credentials for the user", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		// Seed a credential for user-1 directly into the DB
		await seedUser(db, "user-1");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "cred-1",
			userId: "user-1",
			credentialId: "existing-cred-id",
			publicKey: "fake-key",
			counter: 0,
			createdAt: now,
			lastUsedAt: now,
		});

		const opts = await mod.getRegistrationOptions("user-1", "Alice");

		expect(opts.excludeCredentials).toHaveLength(1);
		expect(opts.excludeCredentials[0]?.id).toBe("existing-cred-id");
		expect(opts.excludeCredentials[0]?.type).toBe("public-key");
	});

	it("includes supported pubKeyCredParams algorithms", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getRegistrationOptions("user-1", "Alice");

		const algs = opts.pubKeyCredParams.map((p) => p.alg);
		expect(algs).toContain(-7); // ES256
		expect(algs).toContain(-257); // RS256
	});

	it("stores challenge in database", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getRegistrationOptions("user-1", "Alice");

		const rows = await db
			.select()
			.from(schema.passkeyChallenges)
			.where(schema.passkeyChallenges.challenge ? undefined : undefined);

		const matching = rows.filter((r) => r.challenge === opts.challenge);
		expect(matching).toHaveLength(1);
		expect(matching[0]?.type).toBe("registration");
		expect(matching[0]?.userId).toBe("user-1");
	});
});

// ---------------------------------------------------------------------------
// Authentication options tests
// ---------------------------------------------------------------------------

describe("getAuthenticationOptions", () => {
	it("returns correct rpId", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getAuthenticationOptions();
		expect(opts.rpId).toBe("example.com");
	});

	it("returns empty allowCredentials when no userId given", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getAuthenticationOptions();
		expect(opts.allowCredentials).toEqual([]);
	});

	it("populates allowCredentials for known userId", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-2");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "cred-a",
			userId: "user-2",
			credentialId: "cred-id-a",
			publicKey: "fake-key",
			counter: 5,
			transports: '["internal"]',
			createdAt: now,
			lastUsedAt: now,
		});

		const opts = await mod.getAuthenticationOptions("user-2");

		expect(opts.allowCredentials).toHaveLength(1);
		expect(opts.allowCredentials[0]?.id).toBe("cred-id-a");
		expect(opts.allowCredentials[0]?.type).toBe("public-key");
		expect(opts.allowCredentials[0]?.transports).toEqual(["internal"]);
	});

	it("stores authentication challenge in database", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const opts = await mod.getAuthenticationOptions("user-3");

		const rows = await db.select().from(schema.passkeyChallenges);
		const matching = rows.filter((r) => r.challenge === opts.challenge);
		expect(matching).toHaveLength(1);
		expect(matching[0]?.type).toBe("authentication");
	});
});

// ---------------------------------------------------------------------------
// listCredentials tests
// ---------------------------------------------------------------------------

describe("listCredentials", () => {
	it("returns empty array for user with no credentials", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const creds = await mod.listCredentials("nobody");
		expect(creds).toEqual([]);
	});

	it("returns credentials for the user", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-4");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values([
			{
				id: "c1",
				userId: "user-4",
				credentialId: "cred-1",
				publicKey: "pk1",
				counter: 0,
				deviceName: "iPhone",
				createdAt: now,
				lastUsedAt: now,
			},
			{
				id: "c2",
				userId: "user-4",
				credentialId: "cred-2",
				publicKey: "pk2",
				counter: 3,
				createdAt: now,
				lastUsedAt: now,
			},
		]);

		const creds = await mod.listCredentials("user-4");
		expect(creds).toHaveLength(2);

		const ids = creds.map((c) => c.credentialId).sort();
		expect(ids).toEqual(["cred-1", "cred-2"]);

		const withName = creds.find((c) => c.credentialId === "cred-1");
		expect(withName?.deviceName).toBe("iPhone");
	});

	it("does not return credentials for other users", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-5");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "c3",
			userId: "user-5",
			credentialId: "cred-5",
			publicKey: "pk5",
			counter: 0,
			createdAt: now,
			lastUsedAt: now,
		});

		const creds = await mod.listCredentials("user-99");
		expect(creds).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// removeCredential tests
// ---------------------------------------------------------------------------

describe("removeCredential", () => {
	it("removes the matching credential", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-6");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "cr1",
			userId: "user-6",
			credentialId: "to-remove",
			publicKey: "pk",
			counter: 0,
			createdAt: now,
			lastUsedAt: now,
		});

		await mod.removeCredential("to-remove", "user-6");

		const remaining = await mod.listCredentials("user-6");
		expect(remaining).toHaveLength(0);
	});

	it("does not remove credential belonging to a different user", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-7");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "cr2",
			userId: "user-7",
			credentialId: "others-cred",
			publicKey: "pk",
			counter: 0,
			createdAt: now,
			lastUsedAt: now,
		});

		// Attempt removal with wrong userId
		await mod.removeCredential("others-cred", "user-attacker");

		const remaining = await mod.listCredentials("user-7");
		expect(remaining).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
// Challenge expiry tests
// ---------------------------------------------------------------------------

describe("challenge expiry", () => {
	it("verifyRegistration rejects an expired challenge", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		// Insert an already-expired challenge
		const expiredAt = new Date(Date.now() - 1000);
		await db.insert(schema.passkeyChallenges).values({
			id: "ch-expired",
			challenge: "expired-challenge-value",
			userId: "user-8",
			type: "registration",
			expiresAt: expiredAt,
			createdAt: new Date(),
		});

		// Build a minimal fake clientDataJSON that passes origin/type checks
		// but has the expired challenge value — it will still be rejected at the DB check
		const clientData = {
			type: "webauthn.create",
			challenge: "expired-challenge-value",
			origin: "https://example.com",
		};
		const clientDataJSON = toBase64Url(new TextEncoder().encode(JSON.stringify(clientData)));

		await expect(
			mod.verifyRegistration("user-8", {
				id: "fake",
				rawId: "fake",
				type: "public-key",
				response: {
					clientDataJSON,
					attestationObject: toBase64Url(new Uint8Array([0xa0])), // empty CBOR map
				},
			}),
		).rejects.toThrow();
	});

	it("getAuthenticationOptions cleans up expired challenges", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		// Insert an expired challenge
		await db.insert(schema.passkeyChallenges).values({
			id: "ch-old",
			challenge: "old-challenge",
			userId: null,
			type: "authentication",
			expiresAt: new Date(Date.now() - 5000),
			createdAt: new Date(),
		});

		// Generating new options should sweep expired ones
		await mod.getAuthenticationOptions();

		const rows = await db.select().from(schema.passkeyChallenges);
		const old = rows.find((r) => r.challenge === "old-challenge");
		expect(old).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// handleRequest route dispatch tests
// ---------------------------------------------------------------------------

describe("handleRequest", () => {
	it("returns null for unrelated routes", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const req = new Request("https://example.com/auth/totp/setup", { method: "POST" });
		const result = await mod.handleRequest(req);
		expect(result).toBeNull();
	});

	it("POST /auth/passkey/register/options returns 400 when userId missing", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const req = new Request("https://example.com/auth/passkey/register/options", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userName: "Alice" }), // missing userId
		});

		const res = await mod.handleRequest(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(400);
	});

	it("POST /auth/passkey/register/options returns options for valid request", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const req = new Request("https://example.com/auth/passkey/register/options", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: "user-9", userName: "Alice" }),
		});

		const res = await mod.handleRequest(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(200);

		const body = (await res?.json()) as { challenge: string; rp: { id: string } };
		expect(body.challenge).toBeTruthy();
		expect(body.rp.id).toBe("example.com");
	});

	it("POST /auth/passkey/login/options returns options", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const req = new Request("https://example.com/auth/passkey/login/options", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});

		const res = await mod.handleRequest(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(200);

		const body = (await res?.json()) as { challenge: string; rpId: string };
		expect(body.rpId).toBe("example.com");
		expect(body.challenge).toBeTruthy();
	});

	it("GET /auth/passkey/credentials returns 400 when userId missing", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		const req = new Request("https://example.com/auth/passkey/credentials", {
			method: "GET",
		});

		const res = await mod.handleRequest(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(400);
	});

	it("GET /auth/passkey/credentials returns credential list", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-10");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "lc1",
			userId: "user-10",
			credentialId: "list-cred",
			publicKey: "pk",
			counter: 0,
			createdAt: now,
			lastUsedAt: now,
		});

		const req = new Request("https://example.com/auth/passkey/credentials?userId=user-10", {
			method: "GET",
		});

		const res = await mod.handleRequest(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(200);

		const body = (await res?.json()) as { credentials: { credentialId: string }[] };
		expect(body.credentials).toHaveLength(1);
		expect(body.credentials[0]?.credentialId).toBe("list-cred");
	});

	it("DELETE /auth/passkey/credentials/:id removes a credential", async () => {
		const db = await makeDb();
		const mod = createPasskeyModule(makeConfig(), db);

		await seedUser(db, "user-11");
		const now = new Date();
		await db.insert(schema.passkeyCredentials).values({
			id: "del1",
			userId: "user-11",
			credentialId: "del-cred",
			publicKey: "pk",
			counter: 0,
			createdAt: now,
			lastUsedAt: now,
		});

		const req = new Request("https://example.com/auth/passkey/credentials/del-cred", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: "user-11" }),
		});

		const res = await mod.handleRequest(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(200);

		const remaining = await mod.listCredentials("user-11");
		expect(remaining).toHaveLength(0);
	});
});

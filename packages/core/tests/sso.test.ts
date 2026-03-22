/**
 * Tests for SSO module (SAML 2.0 + OIDC).
 *
 * Covers:
 * - createConnection: persists and returns connection
 * - createConnection: normalises domain to lowercase
 * - getConnectionByDomain: returns connection for enabled domain
 * - getConnectionByDomain: returns null for unknown domain
 * - listConnections: returns all connections for an org
 * - listConnections: returns empty array for unknown org
 * - removeConnection: deletes the record
 * - removeConnection: is a no-op for non-existent ID
 * - getSamlAuthUrl: throws for unknown connection
 * - getSamlAuthUrl: throws for OIDC connection type
 * - getSamlAuthUrl: returns URL with SAMLRequest param for valid SAML connection
 * - getSamlAuthUrl: includes RelayState when provided
 * - getOidcAuthUrl: throws for unknown connection
 * - getOidcAuthUrl: throws for SAML connection type
 * - handleRequest: POST /auth/sso/connections creates and returns 201
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { SsoModule } from "../src/auth/sso.js";
import { createSsoModule } from "../src/auth/sso.js";
import type { Database } from "../src/db/database.js";
import { createDatabase } from "../src/db/database.js";
import { createTables } from "../src/db/migrations.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createTestDb(): Promise<Database> {
	const db = await createDatabase({ provider: "sqlite", url: ":memory:" });
	await createTables(db, "sqlite");
	return db;
}

const SAML_PROVIDER = {
	id: "okta",
	name: "Okta",
	entryPoint: "https://okta.example.com/sso/saml",
	issuer: "https://app.example.com",
	cert: "MIIC...", // fake cert — signature verification is bypassed in tests
	callbackUrl: "https://app.example.com/auth/sso/saml/conn1/acs",
};

const OIDC_PROVIDER = {
	id: "google",
	name: "Google",
	issuer: "https://accounts.google.com",
	clientId: "client-id",
	clientSecret: "client-secret",
	callbackUrl: "https://app.example.com/auth/sso/oidc/conn2/callback",
	scopes: ["openid", "email", "profile"],
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("SsoModule.createConnection", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER], oidc: [OIDC_PROVIDER] }, db);
	});

	it("persists and returns the connection", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		expect(conn.id).toMatch(/^sso_/);
		expect(conn.orgId).toBe("org_1");
		expect(conn.providerId).toBe("okta");
		expect(conn.type).toBe("saml");
		expect(conn.domain).toBe("acme.com");
		expect(conn.enabled).toBe(true);
		expect(conn.createdAt).toBeInstanceOf(Date);
	});

	it("normalises domain to lowercase", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "ACME.COM",
		});
		expect(conn.domain).toBe("acme.com");
	});
});

describe("SsoModule.getConnectionByDomain", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER] }, db);
	});

	it("returns the connection for an enabled domain", async () => {
		await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		const conn = await mod.getConnectionByDomain("acme.com");
		expect(conn).not.toBeNull();
		expect(conn?.domain).toBe("acme.com");
	});

	it("returns null for an unknown domain", async () => {
		const conn = await mod.getConnectionByDomain("unknown.com");
		expect(conn).toBeNull();
	});
});

describe("SsoModule.listConnections", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER], oidc: [OIDC_PROVIDER] }, db);
	});

	it("returns all connections for an org", async () => {
		await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		await mod.createConnection({
			orgId: "org_1",
			providerId: "google",
			type: "oidc",
			domain: "corp.com",
		});
		const conns = await mod.listConnections("org_1");
		expect(conns).toHaveLength(2);
	});

	it("returns empty array for unknown org", async () => {
		const conns = await mod.listConnections("org_unknown");
		expect(conns).toHaveLength(0);
	});

	it("does not return connections from a different org", async () => {
		await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		await mod.createConnection({
			orgId: "org_2",
			providerId: "okta",
			type: "saml",
			domain: "beta.com",
		});
		const conns = await mod.listConnections("org_1");
		expect(conns).toHaveLength(1);
		expect(conns[0]?.domain).toBe("acme.com");
	});
});

describe("SsoModule.removeConnection", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER] }, db);
	});

	it("removes the connection", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		await mod.removeConnection(conn.id);
		const conns = await mod.listConnections("org_1");
		expect(conns).toHaveLength(0);
	});

	it("is a no-op for a non-existent ID", async () => {
		await expect(mod.removeConnection("sso_nonexistent")).resolves.toBeUndefined();
	});
});

describe("SsoModule.getSamlAuthUrl", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER], oidc: [OIDC_PROVIDER] }, db);
	});

	it("throws for an unknown connection", async () => {
		await expect(mod.getSamlAuthUrl("sso_unknown")).rejects.toThrow(/"sso_unknown" not found/);
	});

	it("throws for an OIDC connection type", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "google",
			type: "oidc",
			domain: "corp.com",
		});
		await expect(mod.getSamlAuthUrl(conn.id)).rejects.toThrow(/not a SAML/);
	});

	it("returns a URL with SAMLRequest param for a valid SAML connection", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		const authUrl = await mod.getSamlAuthUrl(conn.id);
		expect(authUrl).toContain("https://okta.example.com/sso/saml");
		expect(authUrl).toContain("SAMLRequest=");
	});

	it("includes RelayState when provided", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		const authUrl = await mod.getSamlAuthUrl(conn.id, "/dashboard");
		expect(authUrl).toContain("RelayState=");
	});
});

describe("SsoModule.getOidcAuthUrl", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER], oidc: [OIDC_PROVIDER] }, db);
	});

	it("throws for an unknown connection", async () => {
		await expect(mod.getOidcAuthUrl("sso_unknown")).rejects.toThrow(/"sso_unknown" not found/);
	});

	it("throws for a SAML connection type", async () => {
		const conn = await mod.createConnection({
			orgId: "org_1",
			providerId: "okta",
			type: "saml",
			domain: "acme.com",
		});
		await expect(mod.getOidcAuthUrl(conn.id)).rejects.toThrow(/not an OIDC/);
	});
});

describe("SsoModule.handleRequest", () => {
	let db: Database;
	let mod: SsoModule;

	beforeEach(async () => {
		db = await createTestDb();
		mod = createSsoModule({ saml: [SAML_PROVIDER] }, db);
	});

	it("POST /auth/sso/connections creates connection and returns 201", async () => {
		const req = new Request("http://localhost/auth/sso/connections", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				orgId: "org_1",
				providerId: "okta",
				type: "saml",
				domain: "acme.com",
			}),
		});
		const res = await mod.handleRequest(req);
		expect(res?.status).toBe(201);
		const body = await res?.json();
		expect(body.id).toMatch(/^sso_/);
	});

	it("returns null for unmatched path", async () => {
		const req = new Request("http://localhost/other/path");
		const res = await mod.handleRequest(req);
		expect(res).toBeNull();
	});

	it("GET /auth/sso/connections/:orgId lists connections", async () => {
		await mod.createConnection({
			orgId: "org_2",
			providerId: "okta",
			type: "saml",
			domain: "test.com",
		});
		const req = new Request("http://localhost/auth/sso/connections/org_2");
		const res = await mod.handleRequest(req);
		expect(res?.status).toBe(200);
		const body = await res?.json();
		expect(Array.isArray(body)).toBe(true);
		expect(body).toHaveLength(1);
	});
});

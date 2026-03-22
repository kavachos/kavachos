/**
 * SSO (SAML 2.0 + OIDC) authentication for KavachOS.
 *
 * Supports enterprise SSO via SAML 2.0 identity providers (Okta, Azure AD,
 * Google Workspace) and generic OIDC providers. Connections are linked to
 * organizations and routed by email domain.
 *
 * @example
 * ```typescript
 * const kavach = await createKavach({
 *   database: { provider: 'sqlite', url: 'kavach.db' },
 *   sso: {
 *     saml: [{ id: 'okta', name: 'Okta', entryPoint: '...', issuer: '...', cert: '...', callbackUrl: '...' }],
 *   },
 * });
 *
 * // Get SAML auth URL (redirect user to this)
 * const url = await kavach.sso.getSamlAuthUrl(connectionId);
 * ```
 */

import { createHash, createVerify, randomBytes, randomUUID } from "node:crypto";
import { deflateRaw } from "node:zlib";
import { and, eq } from "drizzle-orm";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Database } from "../db/database.js";
import { ssoConnections } from "../db/schema.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SsoConfig {
	/** SAML Identity Provider configurations */
	saml?: SamlProvider[];
	/** OIDC Identity Provider configurations */
	oidc?: OidcProvider[];
}

export interface SamlProvider {
	id: string;
	name: string;
	entryPoint: string;
	issuer: string;
	cert: string;
	callbackUrl: string;
	wantAuthnResponseSigned?: boolean;
}

export interface OidcProvider {
	id: string;
	name: string;
	issuer: string;
	clientId: string;
	clientSecret: string;
	callbackUrl: string;
	scopes?: string[];
}

export interface SsoConnection {
	id: string;
	orgId: string;
	providerId: string;
	type: "saml" | "oidc";
	domain: string;
	enabled: boolean;
	createdAt: Date;
}

export interface SsoModule {
	createConnection: (input: {
		orgId: string;
		providerId: string;
		type: "saml" | "oidc";
		domain: string;
	}) => Promise<SsoConnection>;
	getConnectionByDomain: (domain: string) => Promise<SsoConnection | null>;
	listConnections: (orgId: string) => Promise<SsoConnection[]>;
	removeConnection: (connectionId: string) => Promise<void>;
	getSamlAuthUrl: (connectionId: string, relayState?: string) => Promise<string>;
	handleSamlResponse: (
		connectionId: string,
		samlResponse: string,
	) => Promise<{ user: { id: string; email: string; name?: string }; orgId: string }>;
	getOidcAuthUrl: (connectionId: string, state?: string) => Promise<string>;
	handleOidcCallback: (
		connectionId: string,
		code: string,
	) => Promise<{ user: { id: string; email: string; name?: string }; orgId: string }>;
	handleRequest: (request: Request) => Promise<Response | null>;
}

// ---------------------------------------------------------------------------
// SAML helpers
// ---------------------------------------------------------------------------

function deflateRawAsync(input: string): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		deflateRaw(Buffer.from(input, "utf8"), (err, result) => {
			if (err) reject(err);
			else resolve(new Uint8Array(result));
		});
	});
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
	// convert via buffer-compatible approach using btoa on latin1 string
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i] as number);
	}
	return btoa(binary);
}

async function buildSamlAuthnRequest(provider: SamlProvider): Promise<string> {
	const id = `_${randomBytes(16).toString("hex")}`;
	const now = new Date().toISOString();

	const xml = `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="${id}" Version="2.0" IssueInstant="${now}" Destination="${provider.entryPoint}" AssertionConsumerServiceURL="${provider.callbackUrl}"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${provider.issuer}</saml:Issuer></samlp:AuthnRequest>`;

	const deflated = await deflateRawAsync(xml);
	const b64 = uint8ArrayToBase64(deflated);
	return encodeURIComponent(b64);
}

/** Extract text content of an XML element (first match). */
function extractXmlElement(xml: string, localName: string): string | null {
	// Match both ns:localName and localName variants
	const pattern = new RegExp(
		`<(?:[^:>]+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[^:>]+:)?${localName}>`,
		"i",
	);
	const match = pattern.exec(xml);
	return match ? (match[1] ?? null) : null;
}

/** Extract a SAML attribute value by Name. */
function extractSamlAttribute(xml: string, attrName: string): string | null {
	const attrPattern = new RegExp(
		`<(?:[^:>]+:)?Attribute[^>]+Name="${attrName}"[^>]*>[\\s\\S]*?<(?:[^:>]+:)?AttributeValue[^>]*>([^<]*)<`,
		"i",
	);
	const match = attrPattern.exec(xml);
	return match ? (match[1] ?? null) : null;
}

function verifySamlSignature(xml: string, certPem: string): boolean {
	try {
		const signedInfoMatch = /<(?:[^:>]+:)?SignedInfo[\s\S]*?<\/(?:[^:>]+:)?SignedInfo>/i.exec(xml);
		const sigValueMatch =
			/<(?:[^:>]+:)?SignatureValue[^>]*>([\s\S]*?)<\/(?:[^:>]+:)?SignatureValue>/i.exec(xml);

		if (!signedInfoMatch || !sigValueMatch) return false;

		const signedInfo = signedInfoMatch[0];
		const sigValue = (sigValueMatch[1] ?? "").replace(/\s/g, "");

		const normalizedCert = certPem.includes("-----")
			? certPem
			: `-----BEGIN CERTIFICATE-----\n${certPem}\n-----END CERTIFICATE-----`;

		const verifier = createVerify("RSA-SHA256");
		verifier.update(signedInfo);
		return verifier.verify(normalizedCert, sigValue, "base64");
	} catch {
		return false;
	}
}

function parseSamlResponse(
	samlResponse: string,
	cert: string,
): {
	email: string;
	name?: string;
} {
	const decoded = atob(samlResponse);

	const wantSigned = true; // default
	if (wantSigned && !verifySamlSignature(decoded, cert)) {
		throw new Error("SAML response signature verification failed");
	}

	// Extract NameID
	const nameId = extractXmlElement(decoded, "NameID");
	if (!nameId) throw new Error("SAML response missing NameID");

	const email = nameId.trim();

	// Try to extract display name from common attribute names
	const firstName =
		extractSamlAttribute(decoded, "firstName") ??
		extractSamlAttribute(decoded, "givenName") ??
		extractSamlAttribute(
			decoded,
			"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
		) ??
		"";
	const lastName =
		extractSamlAttribute(decoded, "lastName") ??
		extractSamlAttribute(decoded, "surname") ??
		extractSamlAttribute(
			decoded,
			"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
		) ??
		"";

	const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;

	return { email, name };
}

// ---------------------------------------------------------------------------
// OIDC helpers
// ---------------------------------------------------------------------------

async function fetchOidcDiscovery(issuer: string): Promise<{
	authorization_endpoint: string;
	token_endpoint: string;
	jwks_uri: string;
}> {
	const url = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status}`);
	return res.json() as Promise<{
		authorization_endpoint: string;
		token_endpoint: string;
		jwks_uri: string;
	}>;
}

interface OidcTokenResponse {
	access_token: string;
	id_token: string;
	token_type: string;
	expires_in?: number;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

function rowToConnection(row: {
	id: string;
	orgId: string;
	providerId: string;
	type: string;
	domain: string;
	enabled: number;
	createdAt: Date;
}): SsoConnection {
	return {
		id: row.id,
		orgId: row.orgId,
		providerId: row.providerId,
		type: row.type as "saml" | "oidc",
		domain: row.domain,
		enabled: row.enabled === 1,
		createdAt: row.createdAt,
	};
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createSsoModule(config: SsoConfig, db: Database): SsoModule {
	const samlProviders = new Map<string, SamlProvider>((config.saml ?? []).map((p) => [p.id, p]));
	const oidcProviders = new Map<string, OidcProvider>((config.oidc ?? []).map((p) => [p.id, p]));

	async function createConnection(input: {
		orgId: string;
		providerId: string;
		type: "saml" | "oidc";
		domain: string;
	}): Promise<SsoConnection> {
		const id = `sso_${randomUUID().replace(/-/g, "")}`;
		const now = new Date();

		await db.insert(ssoConnections).values({
			id,
			orgId: input.orgId,
			providerId: input.providerId,
			type: input.type,
			domain: input.domain.toLowerCase(),
			enabled: 1,
			createdAt: now,
		});

		return {
			id,
			orgId: input.orgId,
			providerId: input.providerId,
			type: input.type,
			domain: input.domain.toLowerCase(),
			enabled: true,
			createdAt: now,
		};
	}

	async function getConnectionByDomain(domain: string): Promise<SsoConnection | null> {
		const rows = await db
			.select()
			.from(ssoConnections)
			.where(and(eq(ssoConnections.domain, domain.toLowerCase()), eq(ssoConnections.enabled, 1)));
		const row = rows[0];
		if (!row) return null;
		return rowToConnection(row);
	}

	async function listConnections(orgId: string): Promise<SsoConnection[]> {
		const rows = await db.select().from(ssoConnections).where(eq(ssoConnections.orgId, orgId));
		return rows.map(rowToConnection);
	}

	async function removeConnection(connectionId: string): Promise<void> {
		await db.delete(ssoConnections).where(eq(ssoConnections.id, connectionId));
	}

	async function getSamlAuthUrl(connectionId: string, relayState?: string): Promise<string> {
		const rows = await db.select().from(ssoConnections).where(eq(ssoConnections.id, connectionId));
		const conn = rows[0];
		if (!conn) throw new Error(`SSO connection "${connectionId}" not found`);
		if (conn.type !== "saml")
			throw new Error(`Connection "${connectionId}" is not a SAML connection`);

		const provider = samlProviders.get(conn.providerId);
		if (!provider) throw new Error(`SAML provider "${conn.providerId}" not configured`);

		const samlRequest = await buildSamlAuthnRequest(provider);
		const url = new URL(provider.entryPoint);
		url.searchParams.set("SAMLRequest", samlRequest);
		if (relayState) url.searchParams.set("RelayState", relayState);

		return url.toString();
	}

	async function handleSamlResponse(
		connectionId: string,
		samlResponse: string,
	): Promise<{ user: { id: string; email: string; name?: string }; orgId: string }> {
		const rows = await db.select().from(ssoConnections).where(eq(ssoConnections.id, connectionId));
		const conn = rows[0];
		if (!conn) throw new Error(`SSO connection "${connectionId}" not found`);

		const provider = samlProviders.get(conn.providerId);
		if (!provider) throw new Error(`SAML provider "${conn.providerId}" not configured`);

		const { email, name } = parseSamlResponse(samlResponse, provider.cert);

		// Use a deterministic ID based on the email + provider for idempotency
		const userId = `saml_${createHash("sha256").update(`${conn.providerId}:${email}`).digest("hex").slice(0, 32)}`;

		return {
			user: { id: userId, email, name },
			orgId: conn.orgId,
		};
	}

	async function getOidcAuthUrl(connectionId: string, state?: string): Promise<string> {
		const rows = await db.select().from(ssoConnections).where(eq(ssoConnections.id, connectionId));
		const conn = rows[0];
		if (!conn) throw new Error(`SSO connection "${connectionId}" not found`);
		if (conn.type !== "oidc")
			throw new Error(`Connection "${connectionId}" is not an OIDC connection`);

		const provider = oidcProviders.get(conn.providerId);
		if (!provider) throw new Error(`OIDC provider "${conn.providerId}" not configured`);

		const discovery = await fetchOidcDiscovery(provider.issuer);
		const scopes = (provider.scopes ?? ["openid", "profile", "email"]).join(" ");

		const url = new URL(discovery.authorization_endpoint);
		url.searchParams.set("response_type", "code");
		url.searchParams.set("client_id", provider.clientId);
		url.searchParams.set("redirect_uri", provider.callbackUrl);
		url.searchParams.set("scope", scopes);
		if (state) url.searchParams.set("state", state);

		return url.toString();
	}

	async function handleOidcCallback(
		connectionId: string,
		code: string,
	): Promise<{ user: { id: string; email: string; name?: string }; orgId: string }> {
		const rows = await db.select().from(ssoConnections).where(eq(ssoConnections.id, connectionId));
		const conn = rows[0];
		if (!conn) throw new Error(`SSO connection "${connectionId}" not found`);

		const provider = oidcProviders.get(conn.providerId);
		if (!provider) throw new Error(`OIDC provider "${conn.providerId}" not configured`);

		const discovery = await fetchOidcDiscovery(provider.issuer);

		// Exchange code for tokens
		const params = new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: provider.callbackUrl,
			client_id: provider.clientId,
			client_secret: provider.clientSecret,
		});

		const tokenRes = await fetch(discovery.token_endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params.toString(),
		});
		if (!tokenRes.ok) throw new Error(`OIDC token exchange failed: ${tokenRes.status}`);

		const tokens = (await tokenRes.json()) as OidcTokenResponse;

		// Verify id_token with JWKS
		const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
		const { payload } = await jwtVerify(tokens.id_token, jwks, {
			issuer: provider.issuer,
			audience: provider.clientId,
		});

		const email = (payload.email as string | undefined) ?? (payload.sub as string);
		const name = (payload.name as string | undefined) ?? undefined;

		const userId = `oidc_${createHash("sha256").update(`${conn.providerId}:${payload.sub}`).digest("hex").slice(0, 32)}`;

		return {
			user: { id: userId, email, name },
			orgId: conn.orgId,
		};
	}

	async function handleRequest(request: Request): Promise<Response | null> {
		const url = new URL(request.url);
		const { pathname } = url;
		const { method } = request;

		const json = (data: unknown, status = 200) =>
			new Response(JSON.stringify(data), {
				status,
				headers: { "Content-Type": "application/json" },
			});

		// POST /auth/sso/connections
		if (method === "POST" && pathname === "/auth/sso/connections") {
			let body: unknown;
			try {
				body = await request.json();
			} catch {
				return json({ error: "Invalid JSON body" }, 400);
			}
			const b = body as Record<string, unknown>;
			if (
				typeof b.orgId !== "string" ||
				typeof b.providerId !== "string" ||
				typeof b.type !== "string" ||
				typeof b.domain !== "string"
			) {
				return json({ error: "Missing required fields: orgId, providerId, type, domain" }, 400);
			}
			if (b.type !== "saml" && b.type !== "oidc") {
				return json({ error: "type must be 'saml' or 'oidc'" }, 400);
			}
			const conn = await createConnection({
				orgId: b.orgId,
				providerId: b.providerId,
				type: b.type,
				domain: b.domain,
			});
			return json(conn, 201);
		}

		// GET /auth/sso/connections/:orgId
		const listMatch = /^\/auth\/sso\/connections\/([^/]+)$/.exec(pathname);
		if (method === "GET" && listMatch) {
			const orgId = decodeURIComponent(listMatch[1] ?? "");
			const conns = await listConnections(orgId);
			return json(conns);
		}

		// DELETE /auth/sso/connections/:id
		const deleteMatch = /^\/auth\/sso\/connections\/([^/]+)$/.exec(pathname);
		if (method === "DELETE" && deleteMatch) {
			const connId = decodeURIComponent(deleteMatch[1] ?? "");
			await removeConnection(connId);
			return json({ success: true });
		}

		// GET /auth/sso/saml/:connectionId (redirect to IdP)
		const samlInitMatch = /^\/auth\/sso\/saml\/([^/]+)$/.exec(pathname);
		if (method === "GET" && samlInitMatch) {
			const connId = decodeURIComponent(samlInitMatch[1] ?? "");
			const relayState = url.searchParams.get("relayState") ?? undefined;
			try {
				const authUrl = await getSamlAuthUrl(connId, relayState);
				return new Response(null, { status: 302, headers: { Location: authUrl } });
			} catch (err) {
				return json({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
			}
		}

		// POST /auth/sso/saml/:connectionId/acs
		const samlAcsMatch = /^\/auth\/sso\/saml\/([^/]+)\/acs$/.exec(pathname);
		if (method === "POST" && samlAcsMatch) {
			const connId = decodeURIComponent(samlAcsMatch[1] ?? "");
			let samlResponse: string;
			try {
				const formData = await request.formData();
				const val = formData.get("SAMLResponse");
				if (typeof val !== "string") throw new Error("Missing SAMLResponse");
				samlResponse = val;
			} catch {
				return json({ error: "Missing or invalid SAMLResponse" }, 400);
			}
			try {
				const result = await handleSamlResponse(connId, samlResponse);
				return json(result);
			} catch (err) {
				return json({ error: err instanceof Error ? err.message : "SAML error" }, 401);
			}
		}

		// GET /auth/sso/oidc/:connectionId (redirect to IdP)
		const oidcInitMatch = /^\/auth\/sso\/oidc\/([^/]+)$/.exec(pathname);
		if (method === "GET" && oidcInitMatch) {
			const connId = decodeURIComponent(oidcInitMatch[1] ?? "");
			const state = url.searchParams.get("state") ?? undefined;
			try {
				const authUrl = await getOidcAuthUrl(connId, state);
				return new Response(null, { status: 302, headers: { Location: authUrl } });
			} catch (err) {
				return json({ error: err instanceof Error ? err.message : "Unknown error" }, 400);
			}
		}

		// GET /auth/sso/oidc/:connectionId/callback
		const oidcCbMatch = /^\/auth\/sso\/oidc\/([^/]+)\/callback$/.exec(pathname);
		if (method === "GET" && oidcCbMatch) {
			const connId = decodeURIComponent(oidcCbMatch[1] ?? "");
			const code = url.searchParams.get("code");
			if (!code) return json({ error: "Missing code parameter" }, 400);
			try {
				const result = await handleOidcCallback(connId, code);
				return json(result);
			} catch (err) {
				return json({ error: err instanceof Error ? err.message : "OIDC error" }, 401);
			}
		}

		return null;
	}

	return {
		createConnection,
		getConnectionByDomain,
		listConnections,
		removeConnection,
		getSamlAuthUrl,
		handleSamlResponse,
		getOidcAuthUrl,
		handleOidcCallback,
		handleRequest,
	};
}

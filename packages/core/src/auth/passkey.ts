/**
 * Passkey / WebAuthn authentication for KavachOS.
 *
 * Implements server-side WebAuthn (Level 2) without external libraries.
 * Uses Web Crypto API (via node:crypto's webcrypto) for signature verification
 * and a minimal CBOR decoder for attestation object parsing.
 *
 * Flow:
 *   Registration
 *     1. getRegistrationOptions(userId, userName) → send to browser
 *     2. browser calls navigator.credentials.create(options)
 *     3. verifyRegistration(userId, response) → stores credential
 *
 *   Authentication
 *     1. getAuthenticationOptions(userId?) → send to browser
 *     2. browser calls navigator.credentials.get(options)
 *     3. verifyAuthentication(response) → returns userId + credential
 */

import { randomBytes, webcrypto } from "node:crypto";
import { and, eq, lt } from "drizzle-orm";
import type { Database } from "../db/database.js";
import { passkeyChallenges, passkeyCredentials } from "../db/schema.js";
import { decodeCbor } from "./cbor.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PasskeyConfig {
	/** Relying Party name (your app name) */
	rpName: string;
	/** Relying Party ID (your domain, e.g., "example.com") */
	rpId: string;
	/** Expected origin (e.g., "https://example.com") */
	origin: string;
	/** Attestation preference (default: "none") */
	attestation?: "none" | "indirect" | "direct";
	/** User verification requirement (default: "preferred") */
	userVerification?: "required" | "preferred" | "discouraged";
	/** Challenge timeout in ms (default: 60000) */
	challengeTimeout?: number;
}

export interface PasskeyCredential {
	id: string;
	credentialId: string;
	publicKey: string;
	counter: number;
	userId: string;
	deviceName?: string;
	transports?: string[];
	createdAt: Date;
	lastUsedAt: Date;
}

export interface PasskeyModule {
	getRegistrationOptions: (
		userId: string,
		userName: string,
	) => Promise<{
		challenge: string;
		rp: { name: string; id: string };
		user: { id: string; name: string; displayName: string };
		pubKeyCredParams: Array<{ type: "public-key"; alg: number }>;
		timeout: number;
		attestation: string;
		authenticatorSelection: {
			userVerification: string;
			residentKey: string;
			requireResidentKey: boolean;
		};
		excludeCredentials: Array<{ id: string; type: "public-key"; transports?: string[] }>;
	}>;

	verifyRegistration: (
		userId: string,
		response: {
			id: string;
			rawId: string;
			type: "public-key";
			response: {
				clientDataJSON: string;
				attestationObject: string;
			};
			deviceName?: string;
			transports?: string[];
		},
	) => Promise<{ credential: PasskeyCredential }>;

	getAuthenticationOptions: (userId?: string) => Promise<{
		challenge: string;
		rpId: string;
		timeout: number;
		userVerification: string;
		allowCredentials: Array<{ id: string; type: "public-key"; transports?: string[] }>;
	}>;

	verifyAuthentication: (response: {
		id: string;
		rawId: string;
		type: "public-key";
		response: {
			clientDataJSON: string;
			authenticatorData: string;
			signature: string;
		};
	}) => Promise<{ userId: string; credential: PasskeyCredential } | null>;

	listCredentials: (userId: string) => Promise<PasskeyCredential[]>;
	removeCredential: (credentialId: string, userId: string) => Promise<void>;
	handleRequest: (request: Request) => Promise<Response | null>;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface CoseKey {
	kty: number;
	alg: number;
	crv?: number;
	x?: Uint8Array;
	y?: Uint8Array;
}

// COSE algorithm constants
const COSE_ALG_ES256 = -7;
const COSE_ALG_ES384 = -35;
const COSE_ALG_ES512 = -36;
const COSE_ALG_RS256 = -257;
const COSE_ALG_EDDSA = -8;

// ---------------------------------------------------------------------------
// Base64url helpers
// ---------------------------------------------------------------------------

function toBase64Url(bytes: Uint8Array): string {
	const b64 = Buffer.from(bytes).toString("base64");
	return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(str: string): Uint8Array {
	const padded = str.replace(/-/g, "+").replace(/_/g, "/");
	const pad = padded.length % 4;
	const b64 = pad ? padded + "=".repeat(4 - pad) : padded;
	return new Uint8Array(Buffer.from(b64, "base64"));
}

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------

async function sha256(data: Uint8Array): Promise<Uint8Array> {
	const hash = await webcrypto.subtle.digest("SHA-256", data);
	return new Uint8Array(hash);
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

// ---------------------------------------------------------------------------
// COSE key parsing and verification
// ---------------------------------------------------------------------------

function parseCoseKey(coseMap: Map<unknown, unknown>): CoseKey {
	const kty = coseMap.get(1) as number;
	const alg = coseMap.get(3) as number;
	const crv = coseMap.get(-1) as number | undefined;
	const x = coseMap.get(-2) as Uint8Array | undefined;
	const y = coseMap.get(-3) as Uint8Array | undefined;
	return { kty, alg, crv, x, y };
}

async function verifySignatureES(
	coseKey: CoseKey,
	data: Uint8Array,
	signature: Uint8Array,
	namedCurve: string,
	hash: string,
): Promise<boolean> {
	if (!coseKey.x || !coseKey.y) throw new Error("Missing EC key coordinates");

	// Import the public key as JWK
	const jwk = {
		kty: "EC",
		crv: namedCurve,
		x: toBase64Url(coseKey.x),
		y: toBase64Url(coseKey.y),
	};

	const key = await webcrypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve }, false, [
		"verify",
	]);

	// WebAuthn signatures use DER-encoded ECDSA; Web Crypto expects raw (r||s)
	const rawSig = derToRaw(signature);

	return webcrypto.subtle.verify({ name: "ECDSA", hash: { name: hash } }, key, rawSig, data);
}

/**
 * Convert DER-encoded ECDSA signature to raw (r||s) format.
 * DER format: 0x30 len 0x02 rLen r 0x02 sLen s
 */
function derToRaw(der: Uint8Array): Uint8Array {
	if (der[0] !== 0x30) return der; // not DER, pass through
	let offset = 2; // skip 0x30 and total length
	if (der[1] === 0x81) offset = 3; // long form length

	// Read r
	if (der[offset] !== 0x02) throw new Error("Invalid DER: expected 0x02 for r");
	offset++;
	const rLen = der[offset] ?? 0;
	offset++;
	const rBytes = der.slice(offset, offset + rLen);
	offset += rLen;

	// Read s
	if (der[offset] !== 0x02) throw new Error("Invalid DER: expected 0x02 for s");
	offset++;
	const sLen = der[offset] ?? 0;
	offset++;
	const sBytes = der.slice(offset, offset + sLen);

	// Strip leading zero padding (DER uses it to signal positive integers)
	const r = rBytes[0] === 0 ? rBytes.slice(1) : rBytes;
	const s = sBytes[0] === 0 ? sBytes.slice(1) : sBytes;

	// Determine coordinate size from curve (default 32 for P-256)
	const coordSize = Math.max(r.length, s.length, 32);
	const raw = new Uint8Array(coordSize * 2);
	raw.set(r, coordSize - r.length);
	raw.set(s, coordSize * 2 - s.length);
	return raw;
}

async function verifySignatureRSA(
	coseKey: CoseKey,
	data: Uint8Array,
	signature: Uint8Array,
): Promise<boolean> {
	// RSA-PKCS1v15: COSE key has n (-1) and e (-2) in map
	// kty=3 (RSA), -1=n, -2=e
	const coseMap = coseKey as unknown as Map<unknown, unknown>;
	const n = (coseMap instanceof Map ? coseMap.get(-1) : undefined) as Uint8Array | undefined;
	const e = (coseMap instanceof Map ? coseMap.get(-2) : undefined) as Uint8Array | undefined;
	if (!n || !e) throw new Error("Missing RSA key modulus or exponent");

	const jwk = {
		kty: "RSA",
		n: toBase64Url(n),
		e: toBase64Url(e),
		alg: "RS256",
	};

	const key = await webcrypto.subtle.importKey(
		"jwk",
		jwk,
		{ name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
		false,
		["verify"],
	);

	return webcrypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
}

async function verifySignatureEdDSA(
	coseKey: CoseKey,
	data: Uint8Array,
	signature: Uint8Array,
): Promise<boolean> {
	if (!coseKey.x) throw new Error("Missing EdDSA public key x");

	const jwk = {
		kty: "OKP",
		crv: "Ed25519",
		x: toBase64Url(coseKey.x),
	};

	const key = await webcrypto.subtle.importKey("jwk", jwk, { name: "Ed25519" }, false, ["verify"]);

	return webcrypto.subtle.verify({ name: "Ed25519" }, key, signature, data);
}

async function verifyCoseSignature(
	publicKeyCbor: Uint8Array,
	data: Uint8Array,
	signature: Uint8Array,
): Promise<boolean> {
	const decoded = decodeCbor(publicKeyCbor);
	if (!(decoded instanceof Map)) throw new Error("COSE key is not a CBOR map");

	const coseKey = parseCoseKey(decoded);

	switch (coseKey.alg) {
		case COSE_ALG_ES256:
			return verifySignatureES(coseKey, data, signature, "P-256", "SHA-256");
		case COSE_ALG_ES384:
			return verifySignatureES(coseKey, data, signature, "P-384", "SHA-384");
		case COSE_ALG_ES512:
			return verifySignatureES(coseKey, data, signature, "P-521", "SHA-512");
		case COSE_ALG_RS256:
			return verifySignatureRSA(coseKey, data, signature);
		case COSE_ALG_EDDSA:
			return verifySignatureEdDSA(coseKey, data, signature);
		default:
			throw new Error(`Unsupported COSE algorithm: ${coseKey.alg}`);
	}
}

// ---------------------------------------------------------------------------
// AuthData parsing
// ---------------------------------------------------------------------------

interface ParsedAuthData {
	rpIdHash: Uint8Array;
	flags: number;
	signCount: number;
	attestedCredentialData?: {
		aaguid: Uint8Array;
		credentialId: Uint8Array;
		credentialPublicKey: Uint8Array;
		credentialPublicKeyOffset: number;
	};
}

const FLAG_UP = 0x01; // user present
const FLAG_AT = 0x40; // attested credential data included

function parseAuthData(authData: Uint8Array): ParsedAuthData {
	if (authData.length < 37) throw new Error("authData too short");

	const rpIdHash = authData.slice(0, 32);
	const flags = authData[32] ?? 0;
	const signCount =
		(((authData[33] ?? 0) << 24) |
			((authData[34] ?? 0) << 16) |
			((authData[35] ?? 0) << 8) |
			(authData[36] ?? 0)) >>>
		0;

	let attestedCredentialData: ParsedAuthData["attestedCredentialData"];

	if (flags & FLAG_AT) {
		if (authData.length < 55) throw new Error("authData too short for attested credential data");

		const aaguid = authData.slice(37, 53);
		const credentialIdLength = ((authData[53] ?? 0) << 8) | (authData[54] ?? 0);
		const credentialId = authData.slice(55, 55 + credentialIdLength);
		const credentialPublicKeyOffset = 55 + credentialIdLength;
		const credentialPublicKey = authData.slice(credentialPublicKeyOffset);

		attestedCredentialData = {
			aaguid,
			credentialId,
			credentialPublicKey,
			credentialPublicKeyOffset,
		};
	}

	return { rpIdHash, flags, signCount, attestedCredentialData };
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
	try {
		return (await request.json()) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function getPathSegments(url: URL): string[] {
	return url.pathname.split("/").filter(Boolean);
}

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

export function createPasskeyModule(config: PasskeyConfig, db: Database): PasskeyModule {
	const timeout = config.challengeTimeout ?? 60_000;
	const userVerification = config.userVerification ?? "preferred";
	const attestation = config.attestation ?? "none";

	// ── getRegistrationOptions ───────────────────────────────────────────────

	async function getRegistrationOptions(
		userId: string,
		userName: string,
	): ReturnType<PasskeyModule["getRegistrationOptions"]> {
		// Clean up expired challenges
		await db.delete(passkeyChallenges).where(lt(passkeyChallenges.expiresAt, new Date()));

		const challengeBytes = randomBytes(32);
		const challenge = toBase64Url(challengeBytes);
		const id = randomBytes(16).toString("hex");
		const now = new Date();
		const expiresAt = new Date(now.getTime() + timeout);

		await db.insert(passkeyChallenges).values({
			id,
			challenge,
			userId,
			type: "registration",
			expiresAt,
			createdAt: now,
		});

		// Get existing credentials to exclude
		const existing = await db
			.select()
			.from(passkeyCredentials)
			.where(eq(passkeyCredentials.userId, userId));

		const excludeCredentials = existing.map((c) => ({
			id: c.credentialId,
			type: "public-key" as const,
			transports: c.transports ? (JSON.parse(c.transports as string) as string[]) : undefined,
		}));

		return {
			challenge,
			rp: { name: config.rpName, id: config.rpId },
			user: { id: userId, name: userName, displayName: userName },
			pubKeyCredParams: [
				{ type: "public-key", alg: COSE_ALG_ES256 },
				{ type: "public-key", alg: COSE_ALG_RS256 },
				{ type: "public-key", alg: COSE_ALG_EDDSA },
			],
			timeout,
			attestation,
			authenticatorSelection: {
				userVerification,
				residentKey: "preferred",
				requireResidentKey: false,
			},
			excludeCredentials,
		};
	}

	// ── verifyRegistration ───────────────────────────────────────────────────

	async function verifyRegistration(
		userId: string,
		response: Parameters<PasskeyModule["verifyRegistration"]>[1],
	): ReturnType<PasskeyModule["verifyRegistration"]> {
		// 1. Decode clientDataJSON
		const clientDataBytes = fromBase64Url(response.response.clientDataJSON);
		const clientData = JSON.parse(new TextDecoder().decode(clientDataBytes)) as {
			type: string;
			challenge: string;
			origin: string;
		};

		if (clientData.type !== "webauthn.create") {
			throw new Error("Invalid clientData type");
		}
		if (clientData.origin !== config.origin) {
			throw new Error(`Origin mismatch: expected ${config.origin}, got ${clientData.origin}`);
		}

		// 2. Verify challenge
		const challengeRows = await db
			.select()
			.from(passkeyChallenges)
			.where(
				and(
					eq(passkeyChallenges.challenge, clientData.challenge),
					eq(passkeyChallenges.userId, userId),
					eq(passkeyChallenges.type, "registration"),
				),
			);

		const challengeRow = challengeRows[0];
		if (!challengeRow) throw new Error("Challenge not found or already used");
		if (challengeRow.expiresAt < new Date()) throw new Error("Challenge expired");

		// Delete the challenge (one-time use)
		await db.delete(passkeyChallenges).where(eq(passkeyChallenges.id, challengeRow.id));

		// 3. Decode attestationObject (CBOR)
		const attestationBytes = fromBase64Url(response.response.attestationObject);
		const attestation = decodeCbor(attestationBytes);
		if (!(attestation instanceof Map)) throw new Error("Invalid attestation object");

		const authDataRaw = attestation.get("authData") as Uint8Array;
		if (!authDataRaw) throw new Error("Missing authData in attestation object");

		// 4. Parse authData
		const authData = parseAuthData(authDataRaw);

		// 5. Verify rpIdHash
		const expectedRpIdHash = new Uint8Array(
			await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(config.rpId)),
		);
		if (!bytesEqual(authData.rpIdHash, expectedRpIdHash)) {
			throw new Error("rpIdHash mismatch");
		}

		// 6. Verify user present flag
		if (!(authData.flags & FLAG_UP)) {
			throw new Error("User present flag not set");
		}

		// 7. Extract credential data
		if (!authData.attestedCredentialData) {
			throw new Error("No attested credential data in authData");
		}

		const { credentialId, credentialPublicKey } = authData.attestedCredentialData;
		const credentialIdB64 = toBase64Url(credentialId);
		const publicKeyB64 = toBase64Url(credentialPublicKey);

		// 8. Check for duplicate credential ID
		const existing = await db
			.select()
			.from(passkeyCredentials)
			.where(eq(passkeyCredentials.credentialId, credentialIdB64));

		if (existing.length > 0) throw new Error("Credential already registered");

		// 9. Store credential
		const now = new Date();
		const id = randomBytes(16).toString("hex");

		const transports = response.transports ? JSON.stringify(response.transports) : null;

		await db.insert(passkeyCredentials).values({
			id,
			userId,
			credentialId: credentialIdB64,
			publicKey: publicKeyB64,
			counter: authData.signCount,
			deviceName: response.deviceName ?? null,
			transports,
			createdAt: now,
			lastUsedAt: now,
		});

		const credential: PasskeyCredential = {
			id,
			credentialId: credentialIdB64,
			publicKey: publicKeyB64,
			counter: authData.signCount,
			userId,
			deviceName: response.deviceName,
			transports: response.transports,
			createdAt: now,
			lastUsedAt: now,
		};

		return { credential };
	}

	// ── getAuthenticationOptions ─────────────────────────────────────────────

	async function getAuthenticationOptions(
		userId?: string,
	): ReturnType<PasskeyModule["getAuthenticationOptions"]> {
		await db.delete(passkeyChallenges).where(lt(passkeyChallenges.expiresAt, new Date()));

		const challengeBytes = randomBytes(32);
		const challenge = toBase64Url(challengeBytes);
		const id = randomBytes(16).toString("hex");
		const now = new Date();
		const expiresAt = new Date(now.getTime() + timeout);

		await db.insert(passkeyChallenges).values({
			id,
			challenge,
			userId: userId ?? null,
			type: "authentication",
			expiresAt,
			createdAt: now,
		});

		let allowCredentials: Array<{ id: string; type: "public-key"; transports?: string[] }> = [];

		if (userId) {
			const creds = await db
				.select()
				.from(passkeyCredentials)
				.where(eq(passkeyCredentials.userId, userId));

			allowCredentials = creds.map((c) => ({
				id: c.credentialId,
				type: "public-key" as const,
				transports: c.transports ? (JSON.parse(c.transports as string) as string[]) : undefined,
			}));
		}

		return {
			challenge,
			rpId: config.rpId,
			timeout,
			userVerification,
			allowCredentials,
		};
	}

	// ── verifyAuthentication ─────────────────────────────────────────────────

	async function verifyAuthentication(
		response: Parameters<PasskeyModule["verifyAuthentication"]>[0],
	): ReturnType<PasskeyModule["verifyAuthentication"]> {
		// 1. Decode clientDataJSON
		const clientDataBytes = fromBase64Url(response.response.clientDataJSON);
		const clientData = JSON.parse(new TextDecoder().decode(clientDataBytes)) as {
			type: string;
			challenge: string;
			origin: string;
		};

		if (clientData.type !== "webauthn.get") {
			return null;
		}
		if (clientData.origin !== config.origin) {
			return null;
		}

		// 2. Verify challenge
		const challengeRows = await db
			.select()
			.from(passkeyChallenges)
			.where(
				and(
					eq(passkeyChallenges.challenge, clientData.challenge),
					eq(passkeyChallenges.type, "authentication"),
				),
			);

		const challengeRow = challengeRows[0];
		if (!challengeRow) return null;
		if (challengeRow.expiresAt < new Date()) return null;

		await db.delete(passkeyChallenges).where(eq(passkeyChallenges.id, challengeRow.id));

		// 3. Look up credential
		const credentialId = response.id;
		const credRows = await db
			.select()
			.from(passkeyCredentials)
			.where(eq(passkeyCredentials.credentialId, credentialId));

		const credRow = credRows[0];
		if (!credRow) return null;

		// 4. Parse authenticatorData
		const authDataBytes = fromBase64Url(response.response.authenticatorData);
		const authData = parseAuthData(authDataBytes);

		// 5. Verify rpIdHash
		const expectedRpIdHash = new Uint8Array(
			await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(config.rpId)),
		);
		if (!bytesEqual(authData.rpIdHash, expectedRpIdHash)) return null;

		// 6. Verify user present flag
		if (!(authData.flags & FLAG_UP)) return null;

		// 7. Verify signature
		// Data to verify: authData || SHA-256(clientDataJSON)
		const clientDataHash = await sha256(clientDataBytes);
		const signedData = new Uint8Array(authDataBytes.length + clientDataHash.length);
		signedData.set(authDataBytes, 0);
		signedData.set(clientDataHash, authDataBytes.length);

		const signature = fromBase64Url(response.response.signature);
		const publicKeyBytes = fromBase64Url(credRow.publicKey);

		let valid: boolean;
		try {
			valid = await verifyCoseSignature(publicKeyBytes, signedData, signature);
		} catch {
			return null;
		}

		if (!valid) return null;

		// 8. Check counter (clone detection)
		if (credRow.counter > 0 && authData.signCount <= credRow.counter) {
			// Counter did not increase — possible cloned authenticator
			return null;
		}

		// 9. Update counter and lastUsedAt
		const now = new Date();
		await db
			.update(passkeyCredentials)
			.set({ counter: authData.signCount, lastUsedAt: now })
			.where(eq(passkeyCredentials.id, credRow.id));

		const credential: PasskeyCredential = {
			id: credRow.id,
			credentialId: credRow.credentialId,
			publicKey: credRow.publicKey,
			counter: authData.signCount,
			userId: credRow.userId,
			deviceName: credRow.deviceName ?? undefined,
			transports: credRow.transports
				? (JSON.parse(credRow.transports as string) as string[])
				: undefined,
			createdAt: credRow.createdAt,
			lastUsedAt: now,
		};

		return { userId: credRow.userId, credential };
	}

	// ── listCredentials ──────────────────────────────────────────────────────

	async function listCredentials(userId: string): Promise<PasskeyCredential[]> {
		const rows = await db
			.select()
			.from(passkeyCredentials)
			.where(eq(passkeyCredentials.userId, userId));

		return rows.map((r) => ({
			id: r.id,
			credentialId: r.credentialId,
			publicKey: r.publicKey,
			counter: r.counter,
			userId: r.userId,
			deviceName: r.deviceName ?? undefined,
			transports: r.transports ? (JSON.parse(r.transports as string) as string[]) : undefined,
			createdAt: r.createdAt,
			lastUsedAt: r.lastUsedAt,
		}));
	}

	// ── removeCredential ─────────────────────────────────────────────────────

	async function removeCredential(credentialId: string, userId: string): Promise<void> {
		await db
			.delete(passkeyCredentials)
			.where(
				and(
					eq(passkeyCredentials.credentialId, credentialId),
					eq(passkeyCredentials.userId, userId),
				),
			);
	}

	// ── handleRequest ────────────────────────────────────────────────────────

	async function handleRequest(request: Request): Promise<Response | null> {
		const url = new URL(request.url);
		const method = request.method.toUpperCase();
		const segments = getPathSegments(url);

		// POST /auth/passkey/register/options
		if (
			method === "POST" &&
			segments.length === 4 &&
			segments[1] === "passkey" &&
			segments[2] === "register" &&
			segments[3] === "options"
		) {
			const body = await parseBody(request);
			const userId = typeof body.userId === "string" ? body.userId : null;
			const userName = typeof body.userName === "string" ? body.userName : null;
			if (!userId || !userName) {
				return jsonResponse({ error: "userId and userName required" }, 400);
			}
			try {
				const options = await getRegistrationOptions(userId, userName);
				return jsonResponse(options);
			} catch (err) {
				return jsonResponse(
					{ error: err instanceof Error ? err.message : "Failed to generate options" },
					500,
				);
			}
		}

		// POST /auth/passkey/register/verify
		if (
			method === "POST" &&
			segments.length === 4 &&
			segments[1] === "passkey" &&
			segments[2] === "register" &&
			segments[3] === "verify"
		) {
			const body = await parseBody(request);
			const userId = typeof body.userId === "string" ? body.userId : null;
			if (!userId) return jsonResponse({ error: "userId required" }, 400);

			const resp = body.response as Parameters<PasskeyModule["verifyRegistration"]>[1] | undefined;
			if (!resp) return jsonResponse({ error: "response required" }, 400);

			try {
				const result = await verifyRegistration(userId, resp);
				return jsonResponse(result);
			} catch (err) {
				return jsonResponse(
					{ error: err instanceof Error ? err.message : "Registration failed" },
					400,
				);
			}
		}

		// POST /auth/passkey/login/options
		if (
			method === "POST" &&
			segments.length === 4 &&
			segments[1] === "passkey" &&
			segments[2] === "login" &&
			segments[3] === "options"
		) {
			const body = await parseBody(request);
			const userId = typeof body.userId === "string" ? body.userId : undefined;
			try {
				const options = await getAuthenticationOptions(userId);
				return jsonResponse(options);
			} catch (err) {
				return jsonResponse(
					{ error: err instanceof Error ? err.message : "Failed to generate options" },
					500,
				);
			}
		}

		// POST /auth/passkey/login/verify
		if (
			method === "POST" &&
			segments.length === 4 &&
			segments[1] === "passkey" &&
			segments[2] === "login" &&
			segments[3] === "verify"
		) {
			const body = await parseBody(request);
			const resp = body.response as
				| Parameters<PasskeyModule["verifyAuthentication"]>[0]
				| undefined;
			if (!resp) return jsonResponse({ error: "response required" }, 400);

			try {
				const result = await verifyAuthentication(resp);
				if (!result) return jsonResponse({ error: "Authentication failed" }, 401);
				return jsonResponse(result);
			} catch (err) {
				return jsonResponse(
					{ error: err instanceof Error ? err.message : "Authentication failed" },
					401,
				);
			}
		}

		// GET /auth/passkey/credentials
		if (
			method === "GET" &&
			segments.length === 3 &&
			segments[1] === "passkey" &&
			segments[2] === "credentials"
		) {
			const userId = url.searchParams.get("userId");
			if (!userId) return jsonResponse({ error: "userId query param required" }, 400);

			try {
				const creds = await listCredentials(userId);
				return jsonResponse({ credentials: creds });
			} catch (err) {
				return jsonResponse(
					{ error: err instanceof Error ? err.message : "Failed to list credentials" },
					500,
				);
			}
		}

		// DELETE /auth/passkey/credentials/:id
		if (
			method === "DELETE" &&
			segments.length === 4 &&
			segments[1] === "passkey" &&
			segments[2] === "credentials"
		) {
			const credentialId = segments[3];
			if (!credentialId) return jsonResponse({ error: "Credential ID required" }, 400);

			const body = await parseBody(request);
			const userId = typeof body.userId === "string" ? body.userId : null;
			if (!userId) return jsonResponse({ error: "userId required" }, 400);

			try {
				await removeCredential(credentialId, userId);
				return jsonResponse({ removed: true });
			} catch (err) {
				return jsonResponse(
					{ error: err instanceof Error ? err.message : "Failed to remove credential" },
					500,
				);
			}
		}

		return null;
	}

	return {
		getRegistrationOptions,
		verifyRegistration,
		getAuthenticationOptions,
		verifyAuthentication,
		listCredentials,
		removeCredential,
		handleRequest,
	};
}

/** W3C DID Document (simplified for agent use) */
export interface DidDocument {
	"@context": string[];
	id: string; // e.g., did:key:z6Mk...
	controller: string;
	verificationMethod: VerificationMethod[];
	authentication: string[];
	assertionMethod: string[];
	capabilityInvocation: string[];
	capabilityDelegation: string[];
	service?: ServiceEndpoint[];
}

export interface VerificationMethod {
	id: string; // did#keyId
	type: "JsonWebKey2020";
	controller: string;
	publicKeyJwk: JsonWebKey;
}

export interface ServiceEndpoint {
	id: string;
	type: string;
	serviceEndpoint: string;
}

/** DID-enabled agent identity */
export interface AgentDid {
	agentId: string;
	did: string; // did:key:z6Mk... or did:web:...
	method: "key" | "web";
	publicKeyJwk: JsonWebKey; // Ed25519 public key in JWK format
	didDocument: DidDocument;
	createdAt: Date;
}

/** Key pair for signing (private key never stored in DB) */
export interface DidKeyPair {
	did: string;
	publicKeyJwk: JsonWebKey;
	privateKeyJwk: JsonWebKey; // caller must store securely
	didDocument: DidDocument;
}

export interface DidWebConfig {
	domain: string; // e.g., "auth.example.com"
	path?: string; // e.g., "agents" → did:web:auth.example.com:agents:agentId
}

/** Signed payload (JWS compact serialization) */
export interface SignedPayload {
	jws: string; // compact JWS
	payload: Record<string, unknown>;
	issuer: string; // DID of signer
}

/** Verification result */
export interface VerificationResult {
	valid: boolean;
	payload?: Record<string, unknown>;
	issuer?: string;
	error?: string;
}

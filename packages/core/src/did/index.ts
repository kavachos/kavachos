export { buildDidDocument, generateDidKey, resolveDidKey } from "./key-method.js";
export type { DidModule } from "./module.js";
export { createDidModule } from "./module.js";
export { createPresentation, signPayload, verifyPayload, verifyPresentation } from "./signing.js";
export type {
	AgentDid,
	DidDocument,
	DidKeyPair,
	DidWebConfig,
	ServiceEndpoint,
	SignedPayload,
	VerificationMethod,
	VerificationResult,
} from "./types.js";
export { generateDidWeb, getDidWebUrl, resolveDidWeb } from "./web-method.js";

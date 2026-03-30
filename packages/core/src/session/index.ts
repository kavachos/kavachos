export type { CookieOptions, SameSite } from "./cookie.js";
export {
	getCookie,
	parseCookies,
	parseCookiesFromRequest,
	serializeCookie,
	serializeCookieDeletion,
} from "./cookie.js";
export type { CsrfValidationResult } from "./csrf.js";
export { generateCsrfToken, validateCsrfToken, validateOrigin } from "./csrf.js";
// Session freshness enforcement for sensitive operations
export type { SessionFreshnessConfig, SessionFreshnessModule } from "./freshness.js";
export { createSessionFreshnessModule } from "./freshness.js";
export type {
	CookieSessionConfig,
	CookieSessionManager,
	CreateSessionResult,
	ValidateSessionResult,
} from "./manager.js";
export { createCookieSessionManager } from "./manager.js";
// Multi-session support
export type { MultiSessionConfig, MultiSessionModule, SessionInfo } from "./multi-session.js";
export {
	buildSessionMetadata,
	createMultiSessionModule,
	MultiSessionLimitError,
} from "./multi-session.js";
// Refresh token rotation and reuse detection
export type {
	AccessTokenPayload,
	RefreshError,
	RefreshHandleResult,
	RefreshResult,
	RefreshSessionConfig,
	SessionRefresher,
	SessionRefresherConfig,
} from "./refresh.js";
export { createSessionRefresher, RefreshTokenError } from "./refresh.js";
export type { Session, SessionConfig, SessionManager } from "./session.js";
export { createSessionManager } from "./session.js";
export type {
	ConsumeTokenResult,
	ConsumeTokenStatus,
	TokenFamily,
	TokenFamilyStore,
} from "./token-family.js";
export { createTokenFamilyStore } from "./token-family.js";

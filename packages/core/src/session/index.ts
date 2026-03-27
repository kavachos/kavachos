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
export type { Session, SessionConfig, SessionManager } from "./session.js";
export { createSessionManager } from "./session.js";

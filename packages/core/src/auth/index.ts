/**
 * Human auth adapter system for KavachOS.
 *
 * Lets KavachOS plug into existing auth providers (better-auth, Auth.js,
 * Clerk, or a custom resolver) so that human user identity can be resolved
 * from an incoming HTTP request before agent operations are performed.
 *
 * @example
 * ```typescript
 * import { createKavach } from 'kavachos';
 * import { bearerAuth } from 'kavachos/auth';
 *
 * const kavach = await createKavach({
 *   database: { provider: 'sqlite', url: 'kavach.db' },
 *   auth: bearerAuth({ secret: process.env.JWT_SECRET }),
 * });
 *
 * const user = await kavach.resolveUser(request);
 * ```
 */

export type { BearerAuthOptions } from "./adapters/bearer.js";

// Built-in adapters
export { bearerAuth } from "./adapters/bearer.js";
export { customAuth } from "./adapters/custom.js";
export type { HeaderAuthOptions } from "./adapters/header.js";
export { headerAuth } from "./adapters/header.js";
// Admin module
export type { AdminConfig, AdminModule, AdminUser } from "./admin.js";
export { createAdminModule } from "./admin.js";
// API key management
export type { ApiKey, ApiKeyManagerConfig, ApiKeyManagerModule } from "./api-key-manager.js";
export { createApiKeyManagerModule } from "./api-key-manager.js";
// Email OTP
export type { EmailOtpConfig, EmailOtpModule } from "./email-otp.js";
export { createEmailOtpModule } from "./email-otp.js";
// Magic link (passwordless email)
export type { MagicLinkConfig, MagicLinkModule } from "./magic-link.js";
export { createMagicLinkModule } from "./magic-link.js";
// Organizations + RBAC
export type {
	Organization,
	OrgConfig,
	OrgInvitation,
	OrgMember,
	OrgModule,
	OrgRole,
} from "./organization.js";
export { createOrgModule } from "./organization.js";
// Passkey / WebAuthn authentication
export type { PasskeyConfig, PasskeyCredential, PasskeyModule } from "./passkey.js";
export { createPasskeyModule } from "./passkey.js";
// SSO (SAML 2.0 + OIDC)
export type {
	OidcProvider,
	SamlProvider,
	SsoConfig,
	SsoConnection,
	SsoModule,
} from "./sso.js";
export { createSsoModule } from "./sso.js";
// TOTP two-factor authentication
export type { TotpConfig, TotpModule, TotpSetup } from "./totp.js";
export { createTotpModule } from "./totp.js";
export type { AuthAdapter, ResolvedUser } from "./types.js";

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
// Admin plugin (KavachPlugin wrapper)
export { admin } from "./admin-plugin.js";
// Anonymous auth
export type { AnonymousAuthConfig, AnonymousAuthModule } from "./anonymous.js";
export { createAnonymousAuthModule } from "./anonymous.js";
// Anonymous auth plugin (KavachPlugin wrapper)
export { anonymousAuth } from "./anonymous-plugin.js";
// API key management
export type { ApiKey, ApiKeyManagerConfig, ApiKeyManagerModule } from "./api-key-manager.js";
export { createApiKeyManagerModule } from "./api-key-manager.js";
// API key plugin (KavachPlugin wrapper)
export { apiKeys } from "./api-key-plugin.js";
// Captcha integration (reCAPTCHA, hCaptcha, Turnstile)
export type { CaptchaConfig, CaptchaModule, CaptchaVerifyResult } from "./captcha.js";
export { createCaptchaModule } from "./captcha.js";
// OAuth Device Authorization Grant (RFC 8628)
export type {
	DeviceAuthConfig,
	DeviceAuthModule,
	DeviceAuthStatus,
	DeviceCodeResponse,
} from "./device-auth.js";
export { createDeviceAuthModule, deviceAuth } from "./device-auth.js";
// Email OTP
export type { EmailOtpConfig, EmailOtpModule } from "./email-otp.js";
export { createEmailOtpModule } from "./email-otp.js";
// Email OTP plugin (KavachPlugin wrapper)
export { emailOtp } from "./email-otp-plugin.js";
// GDPR module (right to erasure + right to portability)
export type { DeleteOptions, DeleteResult, GdprModule, UserDataExport } from "./gdpr.js";
export { createGdprModule } from "./gdpr.js";
// GDPR plugin (KavachPlugin wrapper)
export { gdpr } from "./gdpr-plugin.js";
// Have I Been Pwned password checking
export type { HibpConfig, HibpModule } from "./hibp.js";
export { createHibpModule, HibpApiError, HibpBreachedError } from "./hibp.js";
// Magic link (passwordless email)
export type { MagicLinkConfig, MagicLinkModule } from "./magic-link.js";
export { createMagicLinkModule } from "./magic-link.js";
// Magic link plugin (KavachPlugin wrapper)
export { magicLink } from "./magic-link-plugin.js";
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
// Organization plugin (KavachPlugin wrapper)
export { organization } from "./organization-plugin.js";
// Passkey / WebAuthn authentication
export type { PasskeyConfig, PasskeyCredential, PasskeyModule } from "./passkey.js";
export { createPasskeyModule } from "./passkey.js";
// Passkey plugin (KavachPlugin wrapper)
export { passkey } from "./passkey-plugin.js";
// Phone number (SMS OTP) authentication
export type { PhoneAuthConfig, PhoneAuthModule } from "./phone.js";
export { createPhoneAuthModule } from "./phone.js";
export type { RateLimitMiddlewareOptions } from "./rate-limit-middleware.js";
export { withRateLimit } from "./rate-limit-middleware.js";
// Rate limiting for auth endpoints
export type { RateLimitConfig, RateLimiter, RateLimitResult } from "./rate-limiter.js";
export { createRateLimiter } from "./rate-limiter.js";
// Sign In With Ethereum (EIP-4361)
export type { SiweConfig, SiweModule, SiweVerifyResult } from "./siwe.js";
export { createSiweModule, siwe } from "./siwe.js";
// SSO (SAML 2.0 + OIDC)
export type {
	OidcProvider,
	SamlProvider,
	SsoAuditEvent,
	SsoConfig,
	SsoConnection,
	SsoModule,
} from "./sso.js";
export { createSsoModule, SSO_ERROR, SsoError } from "./sso.js";
// TOTP two-factor authentication
export type { TotpConfig, TotpModule, TotpSetup } from "./totp.js";
export { createTotpModule } from "./totp.js";
export type { TwoFactorConfig } from "./totp-plugin.js";
// TOTP plugin (KavachPlugin wrapper)
export { twoFactor } from "./totp-plugin.js";
// Trusted device windows for 2FA
export type { TrustedDevice, TrustedDeviceConfig, TrustedDeviceModule } from "./trusted-device.js";
export {
	createTrustedDeviceModule,
	deviceLabelFromRequest,
} from "./trusted-device.js";
export type { AuthAdapter, ResolvedUser } from "./types.js";
// Username + password authentication
export type { UsernameAuthConfig, UsernameAuthModule } from "./username.js";
export { createUsernameAuthModule } from "./username.js";
// Webhook system
export type { WebhookConfig, WebhookEvent, WebhookModule } from "./webhooks.js";
export { createWebhookModule } from "./webhooks.js";

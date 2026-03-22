export { createEmailAuth } from "./email-auth.js";
export { EmailAuthError, ErrorCodes } from "./errors.js";
export { hashPassword, validatePasswordStrength, verifyPassword } from "./password.js";
export type {
	EmailAuthConfig,
	EmailAuthModule,
	EmailUser,
	SignInInput,
	SignUpInput,
} from "./types.js";

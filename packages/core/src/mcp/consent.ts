import type {
	ApproveConsentParams,
	McpAuthContext,
	McpAuthorizationCode,
	Result,
} from "./types.js";
import { generateAuthorizationCode } from "./utils.js";

export type { ApproveConsentParams };

/**
 * Issue an authorization code after a user has explicitly approved consent.
 *
 * Call this from your consent page handler after the user clicks "Allow".
 * The params should match what was passed to the consent page as query params
 * by `handleAuthorize`.
 */
export async function approveConsent(
	ctx: McpAuthContext,
	params: ApproveConsentParams,
): Promise<Result<{ redirectUri: string }>> {
	const {
		userId,
		clientId,
		scope,
		state,
		redirectUri,
		codeChallenge,
		codeChallengeMethod,
		resource,
	} = params;

	// ── Validate client still exists and is enabled ─────────────────
	const client = await ctx.findClient(clientId);
	if (!client) {
		return {
			success: false,
			error: {
				code: "INVALID_CLIENT",
				message: `Unknown client_id: ${clientId}`,
			},
		};
	}

	if (client.disabled) {
		return {
			success: false,
			error: {
				code: "INVALID_CLIENT",
				message: "Client is disabled",
			},
		};
	}

	// ── Validate redirect_uri ────────────────────────────────────────
	if (!client.redirectUris.includes(redirectUri)) {
		return {
			success: false,
			error: {
				code: "INVALID_REDIRECT_URI",
				message: "redirect_uri does not match any registered redirect URI",
			},
		};
	}

	// ── Normalise scopes ─────────────────────────────────────────────
	const effectiveScopes =
		typeof scope === "string" ? scope.split(" ").filter(Boolean) : scope.filter(Boolean);

	if (effectiveScopes.length === 0) {
		return {
			success: false,
			error: {
				code: "INVALID_SCOPE",
				message: "At least one scope is required",
			},
		};
	}

	// ── Generate and store authorization code ────────────────────────
	const code = generateAuthorizationCode();
	const now = new Date();
	const expiresAt = new Date(now.getTime() + ctx.config.codeTtl * 1000);

	const authCode: McpAuthorizationCode = {
		code,
		clientId,
		userId,
		redirectUri,
		scope: effectiveScopes,
		codeChallenge,
		codeChallengeMethod,
		resource: resource ?? null,
		expiresAt,
		createdAt: now,
	};

	await ctx.storeAuthorizationCode(authCode);

	// ── Build redirect back to client ────────────────────────────────
	const redirectUrl = new URL(redirectUri);
	redirectUrl.searchParams.set("code", code);
	if (state) {
		redirectUrl.searchParams.set("state", state);
	}

	return {
		success: true,
		data: {
			redirectUri: redirectUrl.toString(),
		},
	};
}

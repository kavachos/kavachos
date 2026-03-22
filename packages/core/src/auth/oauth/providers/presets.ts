/**
 * Preset OAuth provider configs.
 *
 * Each export is a factory function that takes `(clientId, clientSecret)`
 * and returns a config accepted by `genericOIDC` or usable directly as a
 * plain provider when the provider does not support OIDC discovery.
 *
 * OIDC-capable providers (Auth0, Okta) use `genericOIDC` and require the
 * caller to supply their tenant/domain as a third argument.
 *
 * All other presets return a `GenericOIDCConfig`-compatible object with
 * explicit endpoints so they work without any network discovery call.
 */

import type { OAuthProvider } from "../types.js";
import type { GenericOIDCConfig } from "./generic.js";
import { genericOIDC } from "./generic.js";

// ---------------------------------------------------------------------------
// Re-export type so callers can annotate their config objects
// ---------------------------------------------------------------------------

export type { GenericOIDCConfig };

// ---------------------------------------------------------------------------
// Providers that use explicit endpoints (no OIDC discovery)
// ---------------------------------------------------------------------------

/**
 * Facebook (Meta) OAuth 2.0.
 *
 * Docs: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */
export function facebookProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "facebook",
		name: "Facebook",
		issuer: "https://www.facebook.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["email", "public_profile"],
		authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
		tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
		userinfoUrl: "https://graph.facebook.com/me?fields=id,email,name,picture",
	});
}

/**
 * Spotify OAuth 2.0.
 *
 * Docs: https://developer.spotify.com/documentation/web-api/concepts/authorization
 */
export function spotifyProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "spotify",
		name: "Spotify",
		issuer: "https://accounts.spotify.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["user-read-email", "user-read-private"],
		authorizationUrl: "https://accounts.spotify.com/authorize",
		tokenUrl: "https://accounts.spotify.com/api/token",
		userinfoUrl: "https://api.spotify.com/v1/me",
	});
}

/**
 * Twitch OAuth 2.0 / OIDC.
 *
 * Docs: https://dev.twitch.tv/docs/authentication
 */
export function twitchProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "twitch",
		name: "Twitch",
		issuer: "https://id.twitch.tv/oauth2",
		clientId,
		clientSecret,
		scopes: scopes ?? ["openid", "user:read:email"],
		authorizationUrl: "https://id.twitch.tv/oauth2/authorize",
		tokenUrl: "https://id.twitch.tv/oauth2/token",
		userinfoUrl: "https://id.twitch.tv/oauth2/userinfo",
	});
}

/**
 * Reddit OAuth 2.0.
 *
 * Docs: https://github.com/reddit-archive/reddit/wiki/OAuth2
 */
export function redditProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "reddit",
		name: "Reddit",
		issuer: "https://www.reddit.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["identity"],
		authorizationUrl: "https://www.reddit.com/api/v1/authorize",
		tokenUrl: "https://www.reddit.com/api/v1/access_token",
		userinfoUrl: "https://oauth.reddit.com/api/v1/me",
	});
}

/**
 * Dropbox OAuth 2.0.
 *
 * Docs: https://developers.dropbox.com/oauth-guide
 */
export function dropboxProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "dropbox",
		name: "Dropbox",
		issuer: "https://www.dropbox.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["account_info.read"],
		authorizationUrl: "https://www.dropbox.com/oauth2/authorize",
		tokenUrl: "https://api.dropboxapi.com/oauth2/token",
		userinfoUrl: "https://api.dropboxapi.com/2/users/get_current_account",
	});
}

/**
 * Zoom OAuth 2.0 / OIDC.
 *
 * Docs: https://developers.zoom.us/docs/integrations/oauth/
 */
export function zoomProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "zoom",
		name: "Zoom",
		issuer: "https://zoom.us",
		clientId,
		clientSecret,
		scopes: scopes ?? ["openid", "profile", "email"],
		authorizationUrl: "https://zoom.us/oauth/authorize",
		tokenUrl: "https://zoom.us/oauth/token",
		userinfoUrl: "https://api.zoom.us/v2/users/me",
	});
}

/**
 * Notion OAuth 2.0.
 *
 * Docs: https://developers.notion.com/docs/authorization
 */
export function notionProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "notion",
		name: "Notion",
		issuer: "https://api.notion.com",
		clientId,
		clientSecret,
		scopes: scopes ?? [],
		authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
		tokenUrl: "https://api.notion.com/v1/oauth/token",
		userinfoUrl: "https://api.notion.com/v1/users/me",
	});
}

/**
 * Figma OAuth 2.0.
 *
 * Docs: https://www.figma.com/developers/api#authentication
 */
export function figmaProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "figma",
		name: "Figma",
		issuer: "https://www.figma.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["file_read"],
		authorizationUrl: "https://www.figma.com/oauth",
		tokenUrl: "https://api.figma.com/v1/oauth/token",
		userinfoUrl: "https://api.figma.com/v1/me",
	});
}

/**
 * Bitbucket OAuth 2.0.
 *
 * Docs: https://developer.atlassian.com/cloud/bitbucket/oauth-2/
 */
export function bitbucketProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "bitbucket",
		name: "Bitbucket",
		issuer: "https://bitbucket.org",
		clientId,
		clientSecret,
		scopes: scopes ?? ["account", "email"],
		authorizationUrl: "https://bitbucket.org/site/oauth2/authorize",
		tokenUrl: "https://bitbucket.org/site/oauth2/access_token",
		userinfoUrl: "https://api.bitbucket.org/2.0/user",
	});
}

/**
 * Atlassian OAuth 2.0 (Jira, Confluence, etc.).
 *
 * Docs: https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 */
export function atlassianProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "atlassian",
		name: "Atlassian",
		issuer: "https://auth.atlassian.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["read:me", "offline_access"],
		authorizationUrl: "https://auth.atlassian.com/authorize",
		tokenUrl: "https://auth.atlassian.com/oauth/token",
		userinfoUrl: "https://api.atlassian.com/me",
	});
}

/**
 * Yahoo OAuth 2.0 / OIDC.
 *
 * Docs: https://developer.yahoo.com/oauth2/guide/
 */
export function yahooProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "yahoo",
		name: "Yahoo",
		issuer: "https://api.login.yahoo.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["openid", "profile", "email"],
		authorizationUrl: "https://api.login.yahoo.com/oauth2/request_auth",
		tokenUrl: "https://api.login.yahoo.com/oauth2/get_token",
		userinfoUrl: "https://api.login.yahoo.com/openid/v1/userinfo",
	});
}

/**
 * LINE Login OAuth 2.0 / OIDC.
 *
 * Docs: https://developers.line.biz/en/docs/line-login/integrate-line-login/
 */
export function lineProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "line",
		name: "LINE",
		issuer: "https://access.line.me",
		clientId,
		clientSecret,
		scopes: scopes ?? ["openid", "profile", "email"],
		authorizationUrl: "https://access.line.me/oauth2/v2.1/authorize",
		tokenUrl: "https://api.line.me/oauth2/v2.1/token",
		userinfoUrl: "https://api.line.me/v2/profile",
	});
}

/**
 * Coinbase OAuth 2.0.
 *
 * Docs: https://docs.cdp.coinbase.com/coinbase-app/docs/coinbase-connect-reference
 */
export function coinbaseProvider(
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	return genericOIDC({
		id: "coinbase",
		name: "Coinbase",
		issuer: "https://login.coinbase.com",
		clientId,
		clientSecret,
		scopes: scopes ?? ["wallet:user:read", "wallet:user:email"],
		authorizationUrl: "https://login.coinbase.com/oauth2/auth",
		tokenUrl: "https://login.coinbase.com/oauth2/token",
		userinfoUrl: "https://api.coinbase.com/v2/user",
	});
}

// ---------------------------------------------------------------------------
// OIDC-discovery providers (tenant/domain required)
// ---------------------------------------------------------------------------

/**
 * Auth0 OIDC provider.
 *
 * Requires the Auth0 tenant domain (e.g. `"dev-abc123.us.auth0.com"`).
 *
 * Docs: https://auth0.com/docs/authenticate/protocols/openid-connect-protocol
 *
 * @example
 * ```typescript
 * const auth0 = auth0Provider("dev-abc123.us.auth0.com", clientId, clientSecret);
 * ```
 */
export function auth0Provider(
	domain: string,
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	const issuer = `https://${domain.replace(/^https?:\/\//, "")}`;
	return genericOIDC({
		id: "auth0",
		name: "Auth0",
		issuer,
		clientId,
		clientSecret,
		scopes,
	});
}

/**
 * Okta OIDC provider.
 *
 * Requires the Okta domain (e.g. `"dev-12345678.okta.com"`).
 *
 * Docs: https://developer.okta.com/docs/guides/implement-grant-type/authcode/main/
 *
 * @example
 * ```typescript
 * const okta = oktaProvider("dev-12345678.okta.com", clientId, clientSecret);
 * ```
 */
export function oktaProvider(
	domain: string,
	clientId: string,
	clientSecret: string,
	scopes?: string[],
): OAuthProvider {
	const issuer = `https://${domain.replace(/^https?:\/\//, "")}/oauth2/default`;
	return genericOIDC({
		id: "okta",
		name: "Okta",
		issuer,
		clientId,
		clientSecret,
		scopes,
	});
}

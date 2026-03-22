/**
 * Tests for the generic OIDC factory and preset providers.
 *
 * No network calls are made. Tests validate config structure only.
 */

import { describe, expect, it } from "vitest";
import { genericOIDC } from "../src/auth/oauth/providers/generic.js";
import {
	atlassianProvider,
	auth0Provider,
	bitbucketProvider,
	coinbaseProvider,
	dropboxProvider,
	facebookProvider,
	figmaProvider,
	lineProvider,
	notionProvider,
	oktaProvider,
	redditProvider,
	spotifyProvider,
	twitchProvider,
	yahooProvider,
	zoomProvider,
} from "../src/auth/oauth/providers/presets.js";
import type { OAuthProvider } from "../src/auth/oauth/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DUMMY_ID = "test-client-id";
const DUMMY_SECRET = "test-client-secret";

/**
 * Assert the minimum set of fields required by OAuthProvider.
 * Avoids repeating the same assertions in every test.
 */
function assertValidProvider(provider: OAuthProvider, expectedId: string): void {
	expect(provider.id).toBe(expectedId);
	expect(provider.name).toBeTruthy();
	expect(provider.authorizationUrl).toBeTruthy();
	expect(provider.tokenUrl).toBeTruthy();
	expect(provider.userInfoUrl).toBeTruthy();
	expect(Array.isArray(provider.scopes)).toBe(true);
	expect(provider.scopes.length).toBeGreaterThan(0);
	expect(typeof provider.getAuthorizationUrl).toBe("function");
	expect(typeof provider.exchangeCode).toBe("function");
	expect(typeof provider.getUserInfo).toBe("function");
}

function assertUrlShape(url: string): void {
	expect(() => new URL(url)).not.toThrow();
	expect(url.startsWith("https://")).toBe(true);
}

// ---------------------------------------------------------------------------
// genericOIDC factory
// ---------------------------------------------------------------------------

describe("genericOIDC", () => {
	it("creates a provider with explicit endpoint overrides (no discovery needed)", () => {
		const provider = genericOIDC({
			id: "custom",
			name: "Custom IdP",
			issuer: "https://idp.example.com",
			clientId: DUMMY_ID,
			clientSecret: DUMMY_SECRET,
			authorizationUrl: "https://idp.example.com/oauth/authorize",
			tokenUrl: "https://idp.example.com/oauth/token",
			userinfoUrl: "https://idp.example.com/oauth/userinfo",
		});

		assertValidProvider(provider, "custom");
		expect(provider.name).toBe("Custom IdP");
		expect(provider.authorizationUrl).toBe("https://idp.example.com/oauth/authorize");
		expect(provider.tokenUrl).toBe("https://idp.example.com/oauth/token");
		expect(provider.userInfoUrl).toBe("https://idp.example.com/oauth/userinfo");
	});

	it("includes openid, email, profile in default scopes", () => {
		const provider = genericOIDC({
			id: "test",
			name: "Test",
			issuer: "https://test.example.com",
			clientId: DUMMY_ID,
			clientSecret: DUMMY_SECRET,
			authorizationUrl: "https://test.example.com/authorize",
			tokenUrl: "https://test.example.com/token",
			userinfoUrl: "https://test.example.com/userinfo",
		});

		expect(provider.scopes).toContain("openid");
		expect(provider.scopes).toContain("email");
		expect(provider.scopes).toContain("profile");
	});

	it("merges extra scopes without duplicating defaults", () => {
		const provider = genericOIDC({
			id: "test",
			name: "Test",
			issuer: "https://test.example.com",
			clientId: DUMMY_ID,
			clientSecret: DUMMY_SECRET,
			scopes: ["openid", "custom:read"],
			authorizationUrl: "https://test.example.com/authorize",
			tokenUrl: "https://test.example.com/token",
			userinfoUrl: "https://test.example.com/userinfo",
		});

		expect(provider.scopes).toContain("openid");
		expect(provider.scopes).toContain("email");
		expect(provider.scopes).toContain("profile");
		expect(provider.scopes).toContain("custom:read");
		// No duplicates
		const openidCount = provider.scopes.filter((s) => s === "openid").length;
		expect(openidCount).toBe(1);
	});

	it("builds a correct authorization URL when all overrides are provided", async () => {
		const provider = genericOIDC({
			id: "test",
			name: "Test",
			issuer: "https://test.example.com",
			clientId: DUMMY_ID,
			clientSecret: DUMMY_SECRET,
			authorizationUrl: "https://test.example.com/authorize",
			tokenUrl: "https://test.example.com/token",
			userinfoUrl: "https://test.example.com/userinfo",
		});

		const url = await provider.getAuthorizationUrl(
			"state-xyz",
			"verifier-abc",
			"https://app.example.com/callback",
		);
		const parsed = new URL(url);

		expect(parsed.origin + parsed.pathname).toBe("https://test.example.com/authorize");
		expect(parsed.searchParams.get("client_id")).toBe(DUMMY_ID);
		expect(parsed.searchParams.get("response_type")).toBe("code");
		expect(parsed.searchParams.get("state")).toBe("state-xyz");
		expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
		expect(parsed.searchParams.get("code_challenge")).toBeTruthy();
		expect(parsed.searchParams.get("redirect_uri")).toBe("https://app.example.com/callback");
	});

	it("uses the config redirectUri override when provided", async () => {
		const provider = genericOIDC({
			id: "test",
			name: "Test",
			issuer: "https://test.example.com",
			clientId: DUMMY_ID,
			clientSecret: DUMMY_SECRET,
			redirectUri: "https://custom.example.com/callback",
			authorizationUrl: "https://test.example.com/authorize",
			tokenUrl: "https://test.example.com/token",
			userinfoUrl: "https://test.example.com/userinfo",
		});

		const url = await provider.getAuthorizationUrl(
			"state",
			"verifier",
			"https://ignored.example.com/callback",
		);
		const parsed = new URL(url);

		expect(parsed.searchParams.get("redirect_uri")).toBe("https://custom.example.com/callback");
	});

	it("sets discovery URL as authorizationUrl when no override given", () => {
		const provider = genericOIDC({
			id: "discovery-only",
			name: "Discovery Only",
			issuer: "https://idp.example.com/",
			clientId: DUMMY_ID,
			clientSecret: DUMMY_SECRET,
			// No explicit endpoint overrides — would trigger discovery on actual use
		});

		// The static authorizationUrl exposed on the provider should point to discovery
		expect(provider.authorizationUrl).toBe(
			"https://idp.example.com/.well-known/openid-configuration",
		);
	});
});

// ---------------------------------------------------------------------------
// Preset providers — structure tests (no network)
// ---------------------------------------------------------------------------

describe("facebookProvider", () => {
	it("returns a valid provider config", () => {
		const p = facebookProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "facebook");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("facebook.com");
	});

	it("accepts custom scopes", () => {
		const p = facebookProvider(DUMMY_ID, DUMMY_SECRET, ["email", "user_birthday"]);
		expect(p.scopes).toContain("user_birthday");
	});
});

describe("spotifyProvider", () => {
	it("returns a valid provider config", () => {
		const p = spotifyProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "spotify");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("spotify.com");
	});
});

describe("twitchProvider", () => {
	it("returns a valid provider config", () => {
		const p = twitchProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "twitch");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("twitch.tv");
	});
});

describe("redditProvider", () => {
	it("returns a valid provider config", () => {
		const p = redditProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "reddit");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("reddit.com");
	});
});

describe("dropboxProvider", () => {
	it("returns a valid provider config", () => {
		const p = dropboxProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "dropbox");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("dropbox.com");
	});
});

describe("zoomProvider", () => {
	it("returns a valid provider config", () => {
		const p = zoomProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "zoom");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("zoom.us");
	});
});

describe("notionProvider", () => {
	it("returns a valid provider config", () => {
		const p = notionProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "notion");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("notion.com");
	});
});

describe("figmaProvider", () => {
	it("returns a valid provider config", () => {
		const p = figmaProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "figma");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("figma.com");
	});
});

describe("bitbucketProvider", () => {
	it("returns a valid provider config", () => {
		const p = bitbucketProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "bitbucket");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("bitbucket.org");
	});
});

describe("atlassianProvider", () => {
	it("returns a valid provider config", () => {
		const p = atlassianProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "atlassian");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("atlassian.com");
	});
});

describe("yahooProvider", () => {
	it("returns a valid provider config", () => {
		const p = yahooProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "yahoo");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("yahoo.com");
	});
});

describe("lineProvider", () => {
	it("returns a valid provider config", () => {
		const p = lineProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "line");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("line.me");
	});
});

describe("coinbaseProvider", () => {
	it("returns a valid provider config", () => {
		const p = coinbaseProvider(DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "coinbase");
		assertUrlShape(p.authorizationUrl);
		expect(p.authorizationUrl).toContain("coinbase.com");
	});
});

// ---------------------------------------------------------------------------
// OIDC-discovery presets
// ---------------------------------------------------------------------------

describe("auth0Provider", () => {
	it("returns a valid provider config with issuer derived from domain", () => {
		const p = auth0Provider("dev-abc123.us.auth0.com", DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "auth0");
		expect(p.name).toBe("Auth0");
		// Discovery URL exposed as static authorizationUrl
		expect(p.authorizationUrl).toContain("auth0.com");
	});

	it("strips leading https:// from domain if provided", () => {
		const p = auth0Provider("https://dev-abc123.us.auth0.com", DUMMY_ID, DUMMY_SECRET);
		expect(p.authorizationUrl).not.toContain("https://https://");
	});

	it("accepts custom scopes", () => {
		const p = auth0Provider("dev.auth0.com", DUMMY_ID, DUMMY_SECRET, ["openid", "offline_access"]);
		expect(p.scopes).toContain("offline_access");
	});
});

describe("oktaProvider", () => {
	it("returns a valid provider config with issuer derived from domain", () => {
		const p = oktaProvider("dev-12345678.okta.com", DUMMY_ID, DUMMY_SECRET);
		assertValidProvider(p, "okta");
		expect(p.name).toBe("Okta");
		expect(p.authorizationUrl).toContain("okta.com");
	});

	it("strips leading https:// from domain if provided", () => {
		const p = oktaProvider("https://dev-12345678.okta.com", DUMMY_ID, DUMMY_SECRET);
		expect(p.authorizationUrl).not.toContain("https://https://");
	});

	it("appends /oauth2/default to the Okta issuer path", () => {
		const p = oktaProvider("dev-12345678.okta.com", DUMMY_ID, DUMMY_SECRET);
		// The discovery URL (static authorizationUrl) reflects the issuer path
		expect(p.authorizationUrl).toContain("oauth2/default");
	});
});

// ---------------------------------------------------------------------------
// All presets share required shape — table-driven sweep
// ---------------------------------------------------------------------------

describe("all presets have required fields", () => {
	const providers: Array<[string, OAuthProvider]> = [
		["facebook", facebookProvider(DUMMY_ID, DUMMY_SECRET)],
		["spotify", spotifyProvider(DUMMY_ID, DUMMY_SECRET)],
		["twitch", twitchProvider(DUMMY_ID, DUMMY_SECRET)],
		["reddit", redditProvider(DUMMY_ID, DUMMY_SECRET)],
		["dropbox", dropboxProvider(DUMMY_ID, DUMMY_SECRET)],
		["zoom", zoomProvider(DUMMY_ID, DUMMY_SECRET)],
		["notion", notionProvider(DUMMY_ID, DUMMY_SECRET)],
		["figma", figmaProvider(DUMMY_ID, DUMMY_SECRET)],
		["bitbucket", bitbucketProvider(DUMMY_ID, DUMMY_SECRET)],
		["atlassian", atlassianProvider(DUMMY_ID, DUMMY_SECRET)],
		["yahoo", yahooProvider(DUMMY_ID, DUMMY_SECRET)],
		["line", lineProvider(DUMMY_ID, DUMMY_SECRET)],
		["coinbase", coinbaseProvider(DUMMY_ID, DUMMY_SECRET)],
		["auth0", auth0Provider("tenant.auth0.com", DUMMY_ID, DUMMY_SECRET)],
		["okta", oktaProvider("dev.okta.com", DUMMY_ID, DUMMY_SECRET)],
	];

	for (const [id, provider] of providers) {
		it(`${id} — id, name, authorizationUrl, tokenUrl, scopes are set`, () => {
			expect(provider.id).toBe(id);
			expect(typeof provider.name).toBe("string");
			expect(provider.name.length).toBeGreaterThan(0);
			expect(typeof provider.authorizationUrl).toBe("string");
			expect(provider.authorizationUrl.length).toBeGreaterThan(0);
			expect(typeof provider.tokenUrl).toBe("string");
			expect(provider.tokenUrl.length).toBeGreaterThan(0);
			expect(Array.isArray(provider.scopes)).toBe(true);
		});
	}
});

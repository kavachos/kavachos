/**
 * OAuth / OIDC provider exports.
 *
 * Built-in first-party providers (Google, GitHub, etc.) plus the generic
 * OIDC factory and community presets for 15+ additional services.
 */

export { createAppleProvider } from "./apple.js";
export { createDiscordProvider } from "./discord.js";
export type { GenericOIDCConfig } from "./generic.js";
// Generic OIDC factory
export { genericOIDC } from "./generic.js";
export { createGithubProvider } from "./github.js";
export { createGitlabProvider } from "./gitlab.js";
// First-party providers
export { createGoogleProvider } from "./google.js";
export { createLinkedInProvider } from "./linkedin.js";
export { createMicrosoftProvider } from "./microsoft.js";
// Preset providers
export {
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
} from "./presets.js";
export { createSlackProvider } from "./slack.js";
export { createTwitterProvider } from "./twitter.js";

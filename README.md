# KavachOS

**Auth OS for AI agents and humans**

Identity, permissions, delegation, and audit for the agentic era. Full human auth (email, OAuth, passkeys, SSO) plus agent-first primitives that nothing else ships.

[![npm](https://img.shields.io/npm/v/kavachos)](https://www.npmjs.com/package/kavachos)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![tests](https://img.shields.io/github/actions/workflow/status/kavachos/kavachos/ci.yml?label=tests)](https://github.com/kavachos/kavachos/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

---

## Install

```bash
npm install kavachos
```

## Quickstart

```typescript
import { createKavach } from 'kavachos';
import { emailPassword } from 'kavachos/auth';
import { createHonoAdapter } from '@kavachos/hono';

const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
  plugins: [emailPassword()],
});

// Mount on any framework
const app = new Hono();
app.route('/api/kavach', createHonoAdapter(kavach));

// Create an AI agent with scoped permissions
const agent = await kavach.agent.create({
  ownerId: 'user-123',
  name: 'github-reader',
  type: 'autonomous',
  permissions: [
    { resource: 'mcp:github:*', actions: ['read'] },
    { resource: 'mcp:deploy:production', actions: ['execute'],
      constraints: { requireApproval: true } },
  ],
});

// Authorize and audit
const result = await kavach.authorize(agent.id, {
  action: 'read',
  resource: 'mcp:github:repos',
});
// { allowed: true, auditId: 'aud_...' }
```

---

## What's included

### Human auth (12 methods)

Email + password, magic link, email OTP, phone SMS, passkey/WebAuthn, TOTP 2FA, anonymous, Google One-tap, Sign In With Ethereum, device authorization, username + password, captcha (reCAPTCHA/hCaptcha/Turnstile).

### OAuth (27+ providers)

Google, GitHub, Apple, Microsoft, Discord, Slack, GitLab, LinkedIn, Twitter/X, Facebook, Spotify, Twitch, Reddit, Notion, plus a generic OIDC factory that adds any provider in 10 lines.

### Agent identity

Cryptographic bearer tokens, token rotation, wildcard permission matching, delegation chains with depth limits, immutable audit trail, trust scoring, anomaly detection, budget policies, CIBA approval flows.

### Enterprise

Organizations + RBAC, SAML 2.0 + OIDC SSO, admin (ban/impersonate), API key management, SCIM directory sync, multi-tenant isolation, GDPR (export/delete/anonymize), compliance reports (EU AI Act, NIST, SOC 2, ISO 42001).

### MCP OAuth 2.1

Spec-compliant authorization server for the Model Context Protocol. PKCE S256, RFC 9728/8707/8414/7591.

### OIDC Provider

Act as an OpenID Connect identity provider. Auth code flow, PKCE, refresh token rotation, JWKS endpoint, discovery document.

---

## Packages

### Core

| Package | What |
|---|---|
| `kavachos` | Core SDK: agents, permissions, delegation, audit, auth plugins |
| `@kavachos/client` | Zero-dep TypeScript REST client |
| `@kavachos/cli` | CLI: init, migrate, dashboard |
| `@kavachos/dashboard` | Embeddable React admin dashboard (9 pages) |

### Client libraries

| Package | What |
|---|---|
| `@kavachos/react` | KavachProvider + 6 hooks |
| `@kavachos/vue` | Vue 3 plugin + 6 composables |
| `@kavachos/svelte` | Svelte stores |
| `@kavachos/ui` | 7 pre-built auth components (SignIn, SignUp, UserButton, OAuthButtons, ForgotPassword, TwoFactorVerify, AuthCard) |
| `@kavachos/test-utils` | MockKavachProvider, factories, assertions for testing |
| `@kavachos/expo` | React Native/Expo with SecureStore sessions |
| `@kavachos/electron` | Electron desktop: safeStorage, OAuth popup, IPC bridge |

### Framework adapters

| Package | Framework |
|---|---|
| `@kavachos/hono` | Hono |
| `@kavachos/express` | Express |
| `@kavachos/nextjs` | Next.js (App Router) |
| `@kavachos/fastify` | Fastify |
| `@kavachos/nuxt` | Nuxt |
| `@kavachos/sveltekit` | SvelteKit |
| `@kavachos/astro` | Astro |
| `@kavachos/nestjs` | NestJS |
| `@kavachos/solidstart` | SolidStart |
| `@kavachos/tanstack` | TanStack Start |

---

## UI components

Drop-in auth forms that work out of the box. Override any element's styling with `classNames`, replace any sub-component with `components`, or skip the package entirely and use hooks from `@kavachos/react`.

```tsx
import { SignIn, OAUTH_PROVIDERS } from '@kavachos/ui';

<SignIn
  providers={[OAUTH_PROVIDERS.google, OAUTH_PROVIDERS.github]}
  showMagicLink
  signUpUrl="/sign-up"
  forgotPasswordUrl="/forgot-password"
  onSuccess={() => router.push('/dashboard')}
/>
```

---

## Plugins

Auth methods, security features, and integrations are all plugins. Enable what you need:

```typescript
import { createKavach } from 'kavachos';
import {
  emailPassword,
  magicLink,
  passkey,
  totp,
  organizations,
  sso,
  admin,
  apiKeys,
  captcha,
  multiSession,
  gdpr,
  webhooks,
  i18n,
  jwtSession,
  openApi,
  stripe,
  scim,
  lastLogin,
  oneTimeToken,
} from 'kavachos/auth';

const kavach = createKavach({
  database: { provider: 'postgres', url: process.env.DATABASE_URL },
  plugins: [
    emailPassword(),
    magicLink({ sendMagicLink: async (email, url) => { /* your email sender */ } }),
    passkey(),
    totp(),
    organizations(),
    sso(),
    admin(),
    apiKeys(),
    jwtSession({ secret: process.env.JWT_SECRET }),
    openApi(),
  ],
});
```

---

## Security

- Rate limiting (per-agent and per-IP)
- HIBP password breach checking (k-anonymity)
- Trusted device windows (skip 2FA for 30 days)
- CSRF protection (double-submit cookie)
- Email enumeration prevention
- Session cookies (httpOnly, Secure, SameSite)

---

## Documentation

Full docs at [kavachos.com/docs](https://kavachos.com/docs).

- [Getting started](https://kavachos.com/docs/quickstart)
- [Authentication](https://kavachos.com/docs/auth)
- [Agent identity](https://kavachos.com/docs/agents)
- [Permissions](https://kavachos.com/docs/permissions)
- [Delegation](https://kavachos.com/docs/delegation)
- [MCP OAuth 2.1](https://kavachos.com/docs/mcp)
- [Framework adapters](https://kavachos.com/docs/adapters)
- [REST API reference](https://kavachos.com/docs/api)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

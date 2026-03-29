<p align="center">
  <img src="https://kavachos.com/logo.svg" height="80" alt="KavachOS — authentication and authorization for AI agents and humans" />
</p>

<h1 align="center">KavachOS</h1>

<p align="center">
  Auth for AI agents and humans. One library, both sides.
</p>

<p align="center">
  by <a href="https://glincker.com"><strong>GLINR STUDIOS</strong></a> · a <a href="https://glincker.com">GLINCKER LLC</a> project
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/kavachos"><img src="https://img.shields.io/npm/v/kavachos?style=flat-square&color=c9a84c&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/kavachos"><img src="https://img.shields.io/npm/dm/kavachos?style=flat-square&color=c9a84c&label=downloads" alt="monthly downloads" /></a>
  <a href="https://github.com/kavachos/kavachos/actions"><img src="https://img.shields.io/github/actions/workflow/status/kavachos/kavachos/ci.yml?style=flat-square&label=CI" alt="CI status" /></a>
  <a href="https://github.com/kavachos/kavachos/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT license" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square" alt="TypeScript strict" /></a>
  <a href="https://docs.kavachos.com"><img src="https://img.shields.io/badge/docs-kavachos.com-c9a84c?style=flat-square" alt="documentation" /></a>
</p>

<p align="center">
  <a href="https://docs.kavachos.com/docs/quickstart">Quickstart</a> ·
  <a href="https://docs.kavachos.com/docs">Documentation</a> ·
  <a href="https://github.com/kavachos/kavachos/tree/main/examples">Examples</a> ·
  <a href="https://app.kavachos.com">KavachOS Cloud</a>
</p>

---

## Why KavachOS

Most auth libraries stop at human sign-in. That leaves you stitching together separate systems when your AI agents need identity, scoped permissions, delegation, and audit trails. KavachOS handles both in one place.

### Agent identity

Cryptographic bearer tokens (`kv_...`), wildcard permission matching, delegation chains with depth limits, budget policies, anomaly detection, and CIBA approval flows.

### Human auth

14 methods: email/password, magic link, email OTP, phone SMS, passkey/WebAuthn, TOTP 2FA, anonymous, Google One-tap, Sign In With Ethereum, device authorization, username/password, captcha, password reset, session freshness.

### OAuth

27+ providers out of the box. Google, GitHub, Apple, Microsoft, Discord, Slack, GitLab, LinkedIn, Twitter/X, Facebook, Spotify, Twitch, Reddit, Notion. There's also a generic OIDC factory if yours isn't listed.

### MCP OAuth 2.1

Authorization server for the Model Context Protocol. PKCE S256, RFC 9728 / 8707 / 8414 / 7591.

### Enterprise

Organizations with RBAC, SAML 2.0 and OIDC SSO, admin controls (ban/impersonate), API key management, SCIM directory sync, multi-tenant isolation, GDPR export/delete/anonymize, compliance reports for EU AI Act, NIST, SOC 2, ISO 42001.

### Runs on the edge

Works on Cloudflare Workers, Deno, and Bun without code changes. Three runtime dependencies: `drizzle-orm`, `jose`, `zod`.

### Security

Rate limiting per agent and per IP, HIBP password breach checking, CSRF protection, httpOnly secure cookies, email enumeration prevention, trusted device windows, signed expiring reset tokens, session freshness enforcement.

---

## Install

```bash
npm install kavachos
```

## Quick start

```typescript
import { createKavach } from "kavachos";
import { emailPassword } from "kavachos/auth";
import { createHonoAdapter } from "@kavachos/hono";

const kavach = createKavach({
  database: { provider: "sqlite", url: "kavach.db" },
  plugins: [emailPassword()],
});

// Mount on any framework
const app = new Hono();
app.route("/api/kavach", createHonoAdapter(kavach));

// Create an AI agent with scoped permissions
const agent = await kavach.agent.create({
  ownerId: "user-123",
  name: "github-reader",
  type: "autonomous",
  permissions: [
    { resource: "mcp:github:*", actions: ["read"] },
    {
      resource: "mcp:deploy:production",
      actions: ["execute"],
      constraints: { requireApproval: true },
    },
  ],
});

// Authorize and audit (< 1ms)
const result = await kavach.authorize(agent.id, {
  action: "read",
  resource: "mcp:github:repos",
});
// { allowed: true, auditId: "aud_..." }
```

<details>
<summary><strong>Cloudflare Workers + D1 example</strong></summary>

```typescript
import { createKavach } from "kavachos";
import { Hono } from "hono";

type Env = { KAVACH_DB: D1Database };
const app = new Hono<{ Bindings: Env }>();

app.get("/health", async (c) => {
  const kavach = await createKavach({
    database: { provider: "d1", binding: c.env.KAVACH_DB },
  });

  const agent = await kavach.agent.create({
    ownerId: "user-1",
    name: "my-agent",
    type: "autonomous",
    permissions: [{ resource: "mcp:github:*", actions: ["read"] }],
  });

  return c.json({ agent });
});

export default app;
```

</details>

---

## Packages

### Core

| Package | What it does | |
| --- | --- | --- |
| [`kavachos`](https://www.npmjs.com/package/kavachos) | Core SDK: agents, permissions, delegation, audit, auth plugins | [![npm](https://img.shields.io/npm/v/kavachos?style=flat-square&color=c9a84c)](https://www.npmjs.com/package/kavachos) |
| [`@kavachos/client`](https://www.npmjs.com/package/@kavachos/client) | TypeScript REST client, no dependencies | [![npm](https://img.shields.io/npm/v/@kavachos/client?style=flat-square)](https://www.npmjs.com/package/@kavachos/client) |
| [`@kavachos/cli`](https://www.npmjs.com/package/@kavachos/cli) | `kavach init`, `kavach migrate`, `kavach dashboard` | [![npm](https://img.shields.io/npm/v/@kavachos/cli?style=flat-square)](https://www.npmjs.com/package/@kavachos/cli) |
| [`@kavachos/dashboard`](https://www.npmjs.com/package/@kavachos/dashboard) | Embeddable React admin UI | [![npm](https://img.shields.io/npm/v/@kavachos/dashboard?style=flat-square)](https://www.npmjs.com/package/@kavachos/dashboard) |
| [`@kavachos/gateway`](https://www.npmjs.com/package/@kavachos/gateway) | Auth proxy with rate limiting | [![npm](https://img.shields.io/npm/v/@kavachos/gateway?style=flat-square)](https://www.npmjs.com/package/@kavachos/gateway) |

### Client libraries

| Package | What it does | |
| --- | --- | --- |
| [`@kavachos/react`](https://www.npmjs.com/package/@kavachos/react) | `KavachProvider` + hooks | [![npm](https://img.shields.io/npm/v/@kavachos/react?style=flat-square)](https://www.npmjs.com/package/@kavachos/react) |
| [`@kavachos/vue`](https://www.npmjs.com/package/@kavachos/vue) | Vue 3 plugin + composables | [![npm](https://img.shields.io/npm/v/@kavachos/vue?style=flat-square)](https://www.npmjs.com/package/@kavachos/vue) |
| [`@kavachos/svelte`](https://www.npmjs.com/package/@kavachos/svelte) | Svelte stores | [![npm](https://img.shields.io/npm/v/@kavachos/svelte?style=flat-square)](https://www.npmjs.com/package/@kavachos/svelte) |
| [`@kavachos/ui`](https://www.npmjs.com/package/@kavachos/ui) | Sign-in, sign-up, user button components | [![npm](https://img.shields.io/npm/v/@kavachos/ui?style=flat-square)](https://www.npmjs.com/package/@kavachos/ui) |
| [`@kavachos/expo`](https://www.npmjs.com/package/@kavachos/expo) | React Native / Expo with SecureStore | [![npm](https://img.shields.io/npm/v/@kavachos/expo?style=flat-square)](https://www.npmjs.com/package/@kavachos/expo) |
| [`@kavachos/electron`](https://www.npmjs.com/package/@kavachos/electron) | Electron with safeStorage + OAuth popup | [![npm](https://img.shields.io/npm/v/@kavachos/electron?style=flat-square)](https://www.npmjs.com/package/@kavachos/electron) |
| [`@kavachos/test-utils`](https://www.npmjs.com/package/@kavachos/test-utils) | Mocks, factories, test assertions | [![npm](https://img.shields.io/npm/v/@kavachos/test-utils?style=flat-square)](https://www.npmjs.com/package/@kavachos/test-utils) |

### Framework adapters

| Package | Framework | |
| --- | --- | --- |
| [`@kavachos/hono`](https://www.npmjs.com/package/@kavachos/hono) | Hono | [![npm](https://img.shields.io/npm/v/@kavachos/hono?style=flat-square)](https://www.npmjs.com/package/@kavachos/hono) |
| [`@kavachos/express`](https://www.npmjs.com/package/@kavachos/express) | Express | [![npm](https://img.shields.io/npm/v/@kavachos/express?style=flat-square)](https://www.npmjs.com/package/@kavachos/express) |
| [`@kavachos/nextjs`](https://www.npmjs.com/package/@kavachos/nextjs) | Next.js (App Router) | [![npm](https://img.shields.io/npm/v/@kavachos/nextjs?style=flat-square)](https://www.npmjs.com/package/@kavachos/nextjs) |
| [`@kavachos/fastify`](https://www.npmjs.com/package/@kavachos/fastify) | Fastify | [![npm](https://img.shields.io/npm/v/@kavachos/fastify?style=flat-square)](https://www.npmjs.com/package/@kavachos/fastify) |
| [`@kavachos/nuxt`](https://www.npmjs.com/package/@kavachos/nuxt) | Nuxt | [![npm](https://img.shields.io/npm/v/@kavachos/nuxt?style=flat-square)](https://www.npmjs.com/package/@kavachos/nuxt) |
| [`@kavachos/sveltekit`](https://www.npmjs.com/package/@kavachos/sveltekit) | SvelteKit | [![npm](https://img.shields.io/npm/v/@kavachos/sveltekit?style=flat-square)](https://www.npmjs.com/package/@kavachos/sveltekit) |
| [`@kavachos/astro`](https://www.npmjs.com/package/@kavachos/astro) | Astro | [![npm](https://img.shields.io/npm/v/@kavachos/astro?style=flat-square)](https://www.npmjs.com/package/@kavachos/astro) |
| [`@kavachos/nestjs`](https://www.npmjs.com/package/@kavachos/nestjs) | NestJS | [![npm](https://img.shields.io/npm/v/@kavachos/nestjs?style=flat-square)](https://www.npmjs.com/package/@kavachos/nestjs) |
| [`@kavachos/solidstart`](https://www.npmjs.com/package/@kavachos/solidstart) | SolidStart | [![npm](https://img.shields.io/npm/v/@kavachos/solidstart?style=flat-square)](https://www.npmjs.com/package/@kavachos/solidstart) |
| [`@kavachos/tanstack`](https://www.npmjs.com/package/@kavachos/tanstack) | TanStack Start | [![npm](https://img.shields.io/npm/v/@kavachos/tanstack?style=flat-square)](https://www.npmjs.com/package/@kavachos/tanstack) |

---

## UI components

If you want ready-made forms, `@kavachos/ui` has them. Override styling with `classNames`, swap sub-components, or skip the package entirely and use hooks from `@kavachos/react`.

```tsx
import { SignIn, OAUTH_PROVIDERS } from "@kavachos/ui";

<SignIn
  providers={[OAUTH_PROVIDERS.google, OAUTH_PROVIDERS.github]}
  showMagicLink
  signUpUrl="/sign-up"
  forgotPasswordUrl="/forgot-password"
  onSuccess={() => router.push("/dashboard")}
/>;
```

---

## Plugins

Everything is a plugin. Auth methods, security features, integrations. Turn on what you need:

```typescript
import { createKavach } from "kavachos";
import {
  emailPassword,
  magicLink,
  passkey,
  totp,
  organizations,
  sso,
  admin,
  apiKeys,
  jwtSession,
} from "kavachos/auth";

const kavach = createKavach({
  database: { provider: "postgres", url: process.env.DATABASE_URL },
  plugins: [
    emailPassword({
      passwordReset: {
        sendResetEmail: async (email, url) => {
          /* your email sender */
        },
      },
    }),
    magicLink({
      sendMagicLink: async (email, url) => {
        /* your email sender */
      },
    }),
    passkey(),
    totp(),
    organizations(),
    sso(),
    admin(),
    apiKeys(),
    jwtSession({ secret: process.env.JWT_SECRET }),
  ],
});
```

---

## Docs

[docs.kavachos.com](https://docs.kavachos.com/docs)

- [Getting started](https://docs.kavachos.com/docs/quickstart)
- [Authentication](https://docs.kavachos.com/docs/auth)
- [Agent identity](https://docs.kavachos.com/docs/agents)
- [Permissions and delegation](https://docs.kavachos.com/docs/permissions)
- [MCP OAuth 2.1](https://docs.kavachos.com/docs/mcp)
- [Framework adapters](https://docs.kavachos.com/docs/adapters)
- [API reference](https://docs.kavachos.com/docs/api)

---

## KavachOS Cloud

KavachOS Cloud is the hosted version. Dashboard, billing, no infrastructure.

|       | Free  | Starter | Growth | Scale   | Enterprise |
| ----- | ----- | ------- | ------ | ------- | ---------- |
| MAU   | 1,000 | 10,000  | 50,000 | 200,000 | Custom     |
| Price | $0    | $29/mo  | $79/mo | $199/mo | Custom     |

All plans include MCP OAuth 2.1, agent identity, delegation, trust scoring, and compliance reports.

<p align="center">
  <a href="https://app.kavachos.com/sign-up"><strong>Start free</strong></a> ·
  <a href="https://kavachos.com/pricing">Pricing</a> ·
  <a href="https://docs.kavachos.com/docs/quickstart">Self-host instead</a>
</p>

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

- [SUPPORT.md](SUPPORT.md) for help
- [SECURITY.md](SECURITY.md) to report vulnerabilities
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE)

---

<p align="center">A <a href="https://glincker.com">GLINCKER LLC</a> open source project</p>

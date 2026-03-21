# KavachOS

**The Auth OS for AI Agents**

Identity, permissions, delegation, and audit for the agentic era.
Give every AI agent a cryptographic identity, enforce least-privilege access, and maintain an immutable record of every action it takes.

[![npm](https://img.shields.io/npm/v/kavachos)](https://www.npmjs.com/package/kavachos)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![tests](https://img.shields.io/github/actions/workflow/status/kavachos/kavachos/ci.yml?label=tests)](https://github.com/kavachos/kavachos/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

---

## Install

```bash
npm install kavachos
# or
pnpm add kavachos
```

---

## Quickstart

```typescript
import { createKavach } from 'kavachos';

// 1. Initialize — SQLite for dev, Postgres for prod
const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
});

// 2. Create an agent with scoped permissions
const agent = await kavach.agent.create({
  ownerId: 'user-123',
  name: 'github-reader',
  type: 'autonomous',
  permissions: [
    { resource: 'mcp:github:*', actions: ['read'] },
    {
      resource: 'mcp:deploy:production',
      actions: ['execute'],
      constraints: { requireApproval: true },  // human-in-the-loop
    },
  ],
});

// 3. Authorize an action
const result = await kavach.authorize(agent.id, {
  action: 'read',
  resource: 'mcp:github:repos',
});
// { allowed: true, auditId: 'aud_...' }

// 4. Query the audit trail
const logs = await kavach.audit.query({ agentId: agent.id });
```

---

## Features

### Agent Identity
Create, scope, revoke, and rotate agent credentials. Every agent gets an opaque bearer token (`kv_...`) and a permanent audit identity. Token rotation is instant and atomic.

### Permission Engine
Resource-based access control with colon-separated hierarchies and wildcard matching. Permissions carry optional constraints: rate limits, time windows, IP allowlists, and human-in-the-loop approval gates.

```
mcp:github:*        — all GitHub MCP tools
mcp:github:repos    — only the repos tool
tool:file_write     — a specific local tool
*                   — everything (use sparingly)
```

### Delegation Chains
An orchestrator agent can delegate a subset of its permissions to a sub-agent, with configurable depth limits and expiry. Delegation chains are audited and revocable at any point.

```typescript
await kavach.delegate({
  fromAgent: orchestrator.id,
  toAgent: subAgent.id,
  permissions: [{ resource: 'mcp:github:issues', actions: ['read'] }],
  expiresAt: new Date(Date.now() + 3600_000),
  maxDepth: 2,
});
```

### Audit Trail
Every authorization decision — allowed or denied — is written to an immutable log with the agent ID, user ID, resource, action, result, and duration. Export as JSON or CSV for compliance tooling (EU AI Act Article 12, SOC 2 CC6.1–CC7.2, ISO 42001 Annex A.8).

### MCP OAuth 2.1
A spec-compliant authorization server for the Model Context Protocol. Implements OAuth 2.1, PKCE (S256), Protected Resource Metadata (RFC 9728), Resource Indicators (RFC 8707), and Dynamic Client Registration (RFC 7591).

### Framework Adapters
Drop-in middleware for every major Node.js framework:

| Package | Framework |
|---|---|
| `@kavachos/hono` | Hono |
| `@kavachos/express` | Express |
| `@kavachos/nextjs` | Next.js (App Router) |
| `@kavachos/fastify` | Fastify |
| `@kavachos/nuxt` | Nuxt |
| `@kavachos/sveltekit` | SvelteKit |
| `@kavachos/astro` | Astro |

### Admin Dashboard
An embeddable React dashboard for managing agents, reviewing audit logs, and monitoring permission usage. Also available as a standalone server via `npx kavachos dashboard`.

---

## Why KavachOS?

| | KavachOS | better-auth (agents plugin) | Roll your own |
|---|---|---|---|
| Agent-first data model | yes | no (humans first) | depends |
| Wildcard permission matching | yes | no | depends |
| Delegation chains with depth limits | yes | no | rarely |
| MCP OAuth 2.1 compliant | yes | no | no |
| Immutable compliance-ready audit log | yes | partial | rarely |
| Token rotation | yes | no | rarely |
| Framework agnostic core | yes | yes | yes |

KavachOS treats AI agents as first-class identities — not plugins on top of human auth. The result is a cleaner data model, richer permission semantics, and audit logs that satisfy real compliance requirements out of the box.

---

## Documentation

Full documentation at [kavachos.com/docs](https://kavachos.com/docs).

- [Getting Started](https://kavachos.com/docs/getting-started)
- [Agent Lifecycle](https://kavachos.com/docs/agents)
- [Permission Reference](https://kavachos.com/docs/permissions)
- [Delegation Guide](https://kavachos.com/docs/delegation)
- [MCP OAuth 2.1](https://kavachos.com/docs/mcp)
- [Framework Adapters](https://kavachos.com/docs/adapters)
- [Audit & Compliance](https://kavachos.com/docs/audit)

Source: [github.com/kavachos/kavachos](https://github.com/kavachos/kavachos)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).

# kavachos

Auth OS for AI agents. Identity, permissions, delegation, and audit.

[![npm](https://img.shields.io/npm/v/kavachos)](https://www.npmjs.com/package/kavachos)
[![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/kavachos/kavachos/blob/main/LICENSE)

## Install

```bash
npm install kavachos
# or
pnpm add kavachos
```

## Quick start

```typescript
import { createKavach } from 'kavachos';

const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
});

// Create an agent with scoped permissions
const agent = await kavach.agent.create({
  ownerId: 'user-123',
  name: 'github-reader',
  type: 'autonomous',
  permissions: [
    { resource: 'mcp:github:*', actions: ['read'] },
    {
      resource: 'mcp:deploy:production',
      actions: ['execute'],
      constraints: { requireApproval: true },
    },
  ],
});

// Authorize an action
const result = await kavach.authorize(agent.id, {
  action: 'read',
  resource: 'mcp:github:repos',
});
// { allowed: true, auditId: 'aud_...' }

// Query the audit trail
const logs = await kavach.audit.query({ agentId: agent.id });
```

## What's included

- **Agent identity** - create, scope, revoke, and rotate agent credentials. Each agent gets an opaque bearer token (`kv_...`) and a permanent audit identity.
- **Permission engine** - resource-based access control with colon-separated hierarchies (`mcp:github:*`) and wildcard matching. Constraints support rate limits, time windows, and human-in-the-loop approval gates.
- **Delegation chains** - an orchestrator can delegate a subset of its permissions to a sub-agent, with depth limits and expiry. Chains are auditable and revocable at any point.
- **Audit trail** - every authorization decision is written to an immutable log. Export as JSON or CSV for EU AI Act Article 12, SOC 2 CC6.1-CC7.2, and ISO 42001 compliance.
- **MCP OAuth 2.1** - spec-compliant authorization server for the Model Context Protocol, with PKCE (S256), Protected Resource Metadata (RFC 9728), and Resource Indicators (RFC 8707).

## Full docs

[kavachos.com/docs](https://kavachos.com/docs)

## Source

[github.com/kavachos/kavachos](https://github.com/kavachos/kavachos)

## License

MIT

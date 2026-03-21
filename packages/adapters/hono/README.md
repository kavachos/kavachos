# @kavachos/hono

Hono adapter for KavachOS.

[![npm](https://img.shields.io/npm/v/@kavachos/hono)](https://www.npmjs.com/package/@kavachos/hono)

## Install

```bash
pnpm add kavachos @kavachos/hono
```

## Usage

```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { createKavach } from 'kavachos';
import { kavachHono } from '@kavachos/hono';

const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
});

const app = new Hono();

// Mount all KavachOS routes at /api/kavach
app.route('/api/kavach', kavachHono(kavach));

serve({ fetch: app.fetch, port: 3000 });
```

This mounts the full KavachOS REST API: agent CRUD, authorization, delegations, audit logs, and dashboard stats.

### With MCP OAuth 2.1

```typescript
import { createMcpModule } from 'kavachos/mcp';
import { kavachHono } from '@kavachos/hono';

const mcp = createMcpModule({
  issuer: 'https://your-app.com',
  // ...
});

app.route('/api/kavach', kavachHono(kavach, { mcp }));
```

When `mcp` is provided, the OAuth 2.1 endpoints are enabled:

- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/oauth-protected-resource`
- `POST /mcp/register`
- `GET /mcp/authorize`
- `POST /mcp/token`

## API surface

`kavachHono(kavach, options?)` returns a `Hono` instance with all routes registered. Pass it to `app.route()` with your chosen prefix.

| Option | Type | Description |
|--------|------|-------------|
| `mcp` | `McpAuthModule` | Enables MCP OAuth 2.1 endpoints |

For full docs on agent identity, permissions, delegation, and audit, see the main [kavachos](https://www.npmjs.com/package/kavachos) package.

## Links

- [Documentation](https://kavachos.dev/docs)
- [GitHub](https://github.com/kavachos/kavachos)

## License

MIT

# @kavachos/nuxt

Nuxt adapter for KavachOS.

[![npm](https://img.shields.io/npm/v/@kavachos/nuxt)](https://www.npmjs.com/package/@kavachos/nuxt)

## Install

```bash
pnpm add kavachos @kavachos/nuxt
```

## Usage

Create `server/api/kavach/[...].ts`:

```typescript
import { createKavach } from 'kavachos';
import { kavachNuxt } from '@kavachos/nuxt';

const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
});

export default kavachNuxt(kavach);
```

This handles the full KavachOS REST API under `/api/kavach`: agent CRUD, authorization, delegations, audit logs, and dashboard stats.

### With MCP OAuth 2.1

```typescript
import { createMcpModule } from 'kavachos/mcp';
import { kavachNuxt } from '@kavachos/nuxt';

const mcp = createMcpModule({
  issuer: 'https://your-app.com',
  // ...
});

export default kavachNuxt(kavach, { mcp });
```

When `mcp` is provided, the OAuth 2.1 endpoints are enabled:

- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/oauth-protected-resource`
- `POST /mcp/register`
- `GET /mcp/authorize`
- `POST /mcp/token`

## API surface

`kavachNuxt(kavach, options?)` returns an H3 `EventHandler` for use as a Nuxt server route.

| Option | Type | Description |
|--------|------|-------------|
| `mcp` | `McpAuthModule` | Enables MCP OAuth 2.1 endpoints |
| `basePath` | `string` | URL prefix before the catch-all segment. Defaults to `/api/kavach` |

For full docs on agent identity, permissions, delegation, and audit, see the main [kavachos](https://www.npmjs.com/package/kavachos) package.

## Links

- [Documentation](https://kavachos.dev/docs)
- [GitHub](https://github.com/kavachos/kavachos)

## License

MIT

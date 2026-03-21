# @kavachos/astro

Astro adapter for KavachOS.

[![npm](https://img.shields.io/npm/v/@kavachos/astro)](https://www.npmjs.com/package/@kavachos/astro)

## Install

```bash
pnpm add kavachos @kavachos/astro
```

## Usage

Create `src/pages/api/kavach/[...path].ts`:

```typescript
import { createKavach } from 'kavachos';
import { kavachAstro } from '@kavachos/astro';

const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
});

const handlers = kavachAstro(kavach);

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
export const OPTIONS = handlers.OPTIONS;
```

Or use the catch-all handler to avoid listing each method:

```typescript
export const ALL = handlers.ALL;
```

This handles the full KavachOS REST API under `/api/kavach`: agent CRUD, authorization, delegations, audit logs, and dashboard stats.

### With MCP OAuth 2.1

```typescript
import { createMcpModule } from 'kavachos/mcp';
import { kavachAstro } from '@kavachos/astro';

const mcp = createMcpModule({
  issuer: 'https://your-app.com',
  // ...
});

const handlers = kavachAstro(kavach, { mcp });
```

When `mcp` is provided, the OAuth 2.1 endpoints are enabled:

- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/oauth-protected-resource`
- `POST /mcp/register`
- `GET /mcp/authorize`
- `POST /mcp/token`

## API surface

`kavachAstro(kavach, options?)` returns an object with `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`, and `ALL` handlers for Astro API routes.

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

# @kavachos/express

Express adapter for KavachOS.

[![npm](https://img.shields.io/npm/v/@kavachos/express)](https://www.npmjs.com/package/@kavachos/express)

## Install

```bash
pnpm add kavachos @kavachos/express
```

## Usage

```typescript
import express from 'express';
import { createKavach } from 'kavachos';
import { kavachExpress } from '@kavachos/express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const kavach = createKavach({
  database: { provider: 'sqlite', url: 'kavach.db' },
});

// Mount all KavachOS routes at /auth
app.use('/auth', kavachExpress(kavach));

app.listen(3000);
```

This mounts the full KavachOS REST API: agent CRUD, authorization, delegations, audit logs, and dashboard stats.

### With MCP OAuth 2.1

```typescript
import { createMcpModule } from 'kavachos/mcp';
import { kavachExpress } from '@kavachos/express';

const mcp = createMcpModule({
  issuer: 'https://your-app.com',
  // ...
});

app.use('/auth', kavachExpress(kavach, { mcp }));
```

When `mcp` is provided, the OAuth 2.1 endpoints are enabled:

- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/oauth-protected-resource`
- `POST /mcp/register`
- `GET /mcp/authorize`
- `POST /mcp/token`

## API surface

`kavachExpress(kavach, options?)` returns an Express `Router`. Pass it to `app.use()` with your chosen prefix.

| Option | Type | Description |
|--------|------|-------------|
| `mcp` | `McpAuthModule` | Enables MCP OAuth 2.1 endpoints |

For full docs on agent identity, permissions, delegation, and audit, see the main [kavachos](https://www.npmjs.com/package/kavachos) package.

## Links

- [Documentation](https://kavachos.dev/docs)
- [GitHub](https://github.com/kavachos/kavachos)

## License

MIT

# @kavachos/dashboard

Admin UI for managing agents, permissions, and audit logs.

[![npm](https://img.shields.io/npm/v/@kavachos/dashboard)](https://www.npmjs.com/package/@kavachos/dashboard)

## Install

```bash
npm install @kavachos/dashboard
```

Peer dependencies: React 19+

## Usage

### Embedded component

Mount the dashboard inside your existing React app:

```tsx
import { KavachDashboard } from "@kavachos/dashboard";

export function AdminPage() {
  return (
    <KavachDashboard
      apiUrl="http://localhost:3000"
    />
  );
}
```

The component connects to your KavachOS API and renders the full admin interface, including agent management, permission inspection, and audit log queries.

### Standalone server

Run the dashboard without a React app using the CLI:

```bash
npx kavachos dashboard
# Starts on http://localhost:3100

npx kavachos dashboard --port 4000 --api http://localhost:3000
```

This starts a Hono server that serves the dashboard UI and proxies API requests to your KavachOS backend.

## Options

| Prop / Flag | Default | Description |
|---|---|---|
| `apiUrl` / `--api` | `http://localhost:3000` | URL of your KavachOS API |
| `--port` | `3100` | Port for the standalone server |

## Built with

- React 19
- TailwindCSS 4
- TanStack Query 5
- Lucide React

## Docs and support

- Documentation: [kavachos.com/docs](https://kavachos.com/docs)
- GitHub: [github.com/kavachos/kavachos](https://github.com/kavachos/kavachos)

## License

MIT

# @kavachos/cli

Setup wizard and dev tools for KavachOS.

[![npm](https://img.shields.io/npm/v/@kavachos/cli)](https://www.npmjs.com/package/@kavachos/cli)

## Usage

No install required. Run with `npx`:

```bash
npx kavachos <command>
```

## Commands

### `init`

Prints setup instructions for adding KavachOS to a project, including install steps, configuration scaffold, and adapter options:

```bash
npx kavachos init
```

### `migrate`

Runs database migrations (auto-applies schema on first run):

```bash
npx kavachos migrate
```

### `dashboard`

Launches the standalone admin UI on port 3100 by default:

```bash
npx kavachos dashboard

# Custom port and API URL
npx kavachos dashboard --port 4000 --api http://localhost:3000
```

## Options

| Flag | Default | Description |
|---|---|---|
| `--port` | `3100` | Port for the dashboard server |
| `--api` | `http://localhost:3000` | KavachOS API URL |
| `--help, -h` | | Show help |
| `--version` | | Show version |

## Docs and support

- Documentation: [kavachos.com/docs](https://kavachos.com/docs)
- GitHub: [github.com/kavachos/kavachos](https://github.com/kavachos/kavachos)

## License

MIT

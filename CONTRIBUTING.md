# Contributing to KavachOS

## Workflow

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes with tests
3. Open a pull request against `main`

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

## Code style

Biome handles formatting and linting automatically.

```bash
pnpm lint:fix   # fix lint issues
pnpm format     # format all files
```

The pre-commit hook runs `pnpm lint && pnpm typecheck` before every commit.
Commits that fail are blocked automatically — fix the issue and try again.

## Tests

All new features and bug fixes require tests. Run the full suite with:

```bash
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm coverage       # with coverage report
```

To run tests for a single package:

```bash
vitest packages/core/tests/kavach.test.ts
```

## Commit format

```
<type>: <description>

Co-Authored-By: Glinr <bot@glincker.com>
```

Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `chore`

## Before submitting a PR

- `pnpm typecheck` passes with zero errors
- `pnpm lint` passes with zero warnings on new code
- All new exports are documented with a JSDoc comment
- No `.env` files, credentials, or API keys committed

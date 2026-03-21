# Changesets

This project uses [changesets](https://github.com/changesets/changesets) for version management.

## Adding a changeset

Run `pnpm changeset` to create a new changeset describing your changes.

## Releasing

1. `pnpm changeset version` - bumps versions and updates changelogs
2. `pnpm release` - builds and publishes all packages

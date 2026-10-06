# Contributing

## Development

```sh
git clone https://github.com/oNo500/infra-code.git
cd infra-code
bun install --frozen-lockfile
bun run lint
bun run format:check
```

Starters are independent projects. Install and check them from their own directories: Bun for `cli`, `server` and `web`; pnpm for `fullstack`. Run the affected project's typecheck, lint, tests and build when available.

## Workflow

Use a feature branch and PR targeting `master`. CI must pass before merging. Shared preset development and package releases belong to the separate `presets` repository; this repository has no package release workflow.

## Preset snapshots

Root and starter `vendor/` directories contain fixed Oxlint and Oxfmt tarballs. Update them from the `presets` build, use a new content-hashed filename, and update each affected manifest and lockfile together. Check standalone installation and actual tool commands after an update.

## Security updates

Make targeted updates and preserve unrelated dependency versions. Use the affected project's package manager. Do not regenerate whole lockfiles to clear individual alerts or force overrides for versions pinned by upstream.

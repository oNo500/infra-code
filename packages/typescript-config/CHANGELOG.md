# @infra-x/typescript-config

## 2.0.0

### Major Changes

- d86bc62: Redesign preset structure. Replaces persona-oriented presets (`tsconfig.library.json`,
  `tsconfig.react-library.json`, etc.) with an orthogonal two-layer design:

  - **Atoms** across four dimensions: `runtime-*`, `build-*`, `project-*`, `framework-*`
  - **Recipes** that are pure `extends` arrays: `recipe-app-*`, `recipe-lib-*`

  All old preset paths are removed. See the package README for a migration table.

## 0.1.7

### Patch Changes

- e0507b0: Internal: migrate the repository from pnpm + Turborepo to Bun
  workspaces. No runtime behaviour or API changes. Published artifacts
  remain Node 20+ ESM.

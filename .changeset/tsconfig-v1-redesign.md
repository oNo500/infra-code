---
"@infra-x/typescript-config": major
---

Redesign preset structure. Replaces persona-oriented presets (`tsconfig.library.json`,
`tsconfig.react-library.json`, etc.) with an orthogonal two-layer design:

- **Atoms** across four dimensions: `runtime-*`, `build-*`, `project-*`, `framework-*`
- **Recipes** that are pure `extends` arrays: `recipe-app-*`, `recipe-lib-*`

All old preset paths are removed. See the package README for a migration table.

# @infra-x/tsconfig

## 0.1.0

### Minor Changes

- ca5bdd8: Add an opt-in electron-vite tsconfig preset with three configuration files: a root referencing two type environments, main/preload and renderer. Add Electron lint presets with scoped globals and import checks. Existing tsconfig generation modes, the lint base preset, and formatting defaults keep their behavior.

  The Electron generator refuses to overwrite configurations that need changes. Renderer lint checks include literal dynamic Electron imports through a bundled local plugin.

### Patch Changes

- ca5bdd8: Preserve explicitly cleared `compilerOptions.types` as an empty array. On TypeScript 5, omitting this field automatically includes visible type packages, so callers that use `types: 'none'` or an empty replacement now get the requested restriction. Configurations that omit `types` keep their existing behavior.

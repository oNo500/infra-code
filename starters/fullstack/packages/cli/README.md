# @workspace/cli

Internal CLI tools for the fullstack monorepo. Run via `pnpm theme` from the repo root.

## Stack

- Runtime: Bun
- Args: [citty](https://github.com/unjs/citty)
- Bundler: [tsdown](https://tsdown.dev)
- Lint: `oxlint`
- Tests: `bun test`

## Commands

### `theme`

Switches the shadcn colour theme across the entire monorepo.

```bash
pnpm theme                       # interactive picker
pnpm theme --preset <code>       # apply a known preset directly, e.g. b0
```

**What it does:**

1. Prompts for style, theme, baseColor, radius, font, iconLibrary, menuColor, menuAccent, chartColor
2. Encodes the selection into a shadcn preset code
3. Syncs `packages/ui/components.json`, `apps/web/components.json`, `apps/api-web/components.json`
4. Runs `shadcn add --overwrite` from `packages/ui` to regenerate `shadcn-theme.css` and all components

**Preset codes** are base62-encoded strings (e.g. `b0` = default neutral/nova). Save them to reapply a theme later.

## Adding a command

1. Add `src/commands/<name>.ts` and export a `defineCommand(...)` object
2. Register it in `src/index.ts` under `subCommands`

## Known gotchas

### shadcn alias resolution in monorepos

shadcn resolves write paths from the `aliases` in `components.json` using the executing directory's `tsconfig` paths. If a scoped alias like `@workspace/ui/components` has no matching entry in `tsconfig.json`, shadcn writes it as a literal directory name (e.g. `@workspace/ui/components/button.tsx`).

**Fix already applied:** `packages/ui/components.json` uses relative aliases (`src/components`, `src/lib`, etc.) so shadcn always writes to the correct location when executed from `packages/ui`.

### Do not run `shadcn init` for theme switching

`shadcn init` modifies `layout.tsx`, `package.json`, and other app files as side effects — even with `--no-reinstall`. Use `shadcn add --overwrite` instead, which only touches component files and `shadcn-theme.css`.

### Always execute from `packages/ui`

Running `shadcn add` from an app directory (`apps/api-web`, `apps/web`) causes components to be written into the app's local `src/components/` instead of the shared `packages/ui/src/components/`. The theme command handles this automatically.

# composeConfig Options Reference

All options accept `true` (use defaults), `false` (disable), or an options object.

---

## Default-On Options

### `ignores`

```typescript
interface IgnoresOptions {
  ignores?: string[] | false  // false disables default ignores
  gitignore?: string | boolean
}
```

```typescript
// Append custom ignore paths
ignores: { ignores: ['generated/**', 'dist/**'] }

// Disable default rules entirely
ignores: { ignores: false }
```

### `javascript`

```typescript
type JavaScriptOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```

### `typescript`

```typescript
type TypeScriptOptions = {
  tsconfigRootDir?: string  // required for type-aware rules
  files?: string[]
  overrides?: Record<string, unknown>
}
```

Always set `tsconfigRootDir: import.meta.dirname`. Config files matching `allowDefaultProject` (`*.config.ts`, `*.config.mts`) are auto-injected and get relaxed unsafe rules.

### `stylistic`

```typescript
type StylisticOptions = { overrides?: Record<string, unknown> }
```

### `unicorn`

```typescript
type UnicornOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```

### `depend`

```typescript
interface DependOptions {
  presets?: ('native' | 'microutilities' | 'preferred')[]  // default: all three
  modules?: string[]   // additional banned modules
  allowed?: string[]   // exempt from presets
  overrides?: Record<string, unknown>
}
```

```typescript
depend: { allowed: ['lodash', 'ramda'] }
```

---

## Framework Options

### `react`

Enables @eslint-react, react-hooks, react-refresh rules.

```typescript
type ReactOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```

### `nextjs`

```typescript
type NextjsOptions = { overrides?: Record<string, unknown> }
```

### `tailwind`

```typescript
type TailwindOptions = {
  entryPoint?: string  // default: 'src/global.css'
  files?: string[]
  overrides?: Record<string, unknown>
}
```

---

## Tool Options

### `imports`

`typescript` is auto-injected by `composeConfig()` — use `imports: true`, not `imports: { typescript: true }`.

```typescript
interface ImportsOptions {
  typescript?: boolean
  noRelativeParentImports?: boolean  // ban '../' imports, default: false
  stylistic?: boolean
  overrides?: Record<string, unknown>
}
```

```typescript
// Disallow ../relative imports (enforce path aliases)
imports: { noRelativeParentImports: true }
```

### `prettier`

Always placed last by `composeConfig()` internally — disables conflicting stylistic rules.

```typescript
type PrettierOptions = { overrides?: Record<string, unknown> }
```

---

## Quality Options

### `a11y`

```typescript
type A11yOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```

### `jsdoc`

```typescript
type JsdocOptions = { overrides?: Record<string, unknown> }
```

### `boundaries`

```typescript
interface BoundariesOptions {
  elements?: {
    type: string
    pattern: string | string[]
    capture?: string[]
    mode?: 'file' | 'folder' | 'full'
  }[]
  rules?: {
    from: string | string[]
    allow?: (string | [string, Record<string, string>])[]
    disallow?: string[]
    message?: string
  }[]
  files?: string[]
  overrides?: Record<string, unknown>
}
```

### `packageJson`

```typescript
interface PackageJsonOptions {
  stylistic?: boolean         // default: true
  enforceForPrivate?: boolean // default: false
  overrides?: Record<string, unknown>
}
```

---

## Test Options

### `vitest`

```typescript
type VitestOptions = {
  files?: string[]
  isInEditor?: boolean
  overrides?: Record<string, unknown>
}
```

### `storybook`

```typescript
type StorybookOptions = { overrides?: Record<string, unknown> }
```

---

## Exported Glob Patterns

```typescript
import { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from '@infra-x/eslint-config'
// monorepo: from '@workspace/eslint-config'
```

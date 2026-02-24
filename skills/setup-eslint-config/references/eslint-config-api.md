# eslint-config API Reference

## composeConfig(options) Type Signatures

### Default-ON Options

#### `ignores?: boolean | IgnoresOptions`
```typescript
interface IgnoresOptions {
  ignores?: string[] | false  // false disables default ignores
  gitignore?: string | boolean  // path to .gitignore or true to auto-detect
}
```

#### `javascript?: boolean | JavaScriptOptions`
```typescript
type JavaScriptOptions = {
  files?: string[]       // custom file globs
  overrides?: Record<string, unknown>  // ESLint rule overrides
}
```

#### `typescript?: boolean | TypeScriptOptions`
```typescript
type TypeScriptOptions = {
  tsconfigRootDir?: string  // required for type-aware rules
  files?: string[]
  overrides?: Record<string, unknown>
}
```
Pass `{ tsconfigRootDir: import.meta.dirname }` to enable type-aware rules.

#### `stylistic?: boolean | StylisticOptions`
```typescript
type StylisticOptions = {
  overrides?: Record<string, unknown>
}
```

#### `unicorn?: boolean | UnicornOptions`
```typescript
type UnicornOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```

#### `depend?: boolean | DependOptions`
```typescript
interface DependOptions {
  presets?: ('native' | 'microutilities' | 'preferred')[]  // default: all three
  modules?: string[]   // additional banned modules
  allowed?: string[]   // allow despite presets
  overrides?: Record<string, unknown>
}
```

### Default-OFF Options

#### `react?: boolean | ReactOptions`
```typescript
type ReactOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```
Enables: @eslint-react, react-hooks, react-refresh rules.

#### `nextjs?: boolean | NextjsOptions`
```typescript
type NextjsOptions = {
  overrides?: Record<string, unknown>
}
```

#### `tailwind?: boolean | TailwindOptions`
```typescript
type TailwindOptions = {
  entryPoint?: string  // default: 'src/global.css'
  files?: string[]
  overrides?: Record<string, unknown>
}
```

#### `imports?: boolean | ImportsOptions`
```typescript
interface ImportsOptions {
  typescript?: boolean  // auto-injected when global typescript is enabled
  noRelativeParentImports?: boolean  // ban '../' imports, default: false
  stylistic?: boolean
  overrides?: Record<string, unknown>
}
```
Note: When used via `composeConfig()`, `typescript` is automatically set to `true` if the global `typescript` option is enabled.

#### `prettier?: boolean | PrettierOptions`
```typescript
type PrettierOptions = {
  overrides?: Record<string, unknown>
}
```
Always add last — it disables conflicting stylistic rules.

#### `a11y?: boolean | A11yOptions`
```typescript
type A11yOptions = {
  files?: string[]
  overrides?: Record<string, unknown>
}
```

#### `jsdoc?: boolean | JsdocOptions`
```typescript
type JsdocOptions = {
  overrides?: Record<string, unknown>
}
```

#### `boundaries?: boolean | BoundariesOptions`
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

#### `packageJson?: boolean | PackageJsonOptions`
```typescript
interface PackageJsonOptions {
  stylistic?: boolean       // default: true
  enforceForPrivate?: boolean  // default: false
  overrides?: Record<string, unknown>
}
```

#### `vitest?: boolean | VitestOptions`
```typescript
type VitestOptions = {
  files?: string[]
  isInEditor?: boolean
  overrides?: Record<string, unknown>
}
```

#### `storybook?: boolean | StorybookOptions`
```typescript
type StorybookOptions = {
  overrides?: Record<string, unknown>
}
```

## Exported Glob Patterns

```typescript
import { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from '@infra-x/eslint-config'
// or from '@workspace/eslint-config' in monorepo
```

Useful for passing to `files` options or custom ESLint config blocks.

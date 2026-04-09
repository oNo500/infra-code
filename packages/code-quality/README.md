# @infra-x/code-quality

Shared [Oxlint](https://oxc.rs/) + [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) presets for infra-x projects. One install, lint and format ready.

## Install

```bash
pnpm add -D @infra-x/code-quality
```

## Lint (Oxlint)

Create `oxlint.config.ts`:

```ts
import { base, unicorn, react, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base, unicorn, react, vitest],
})
```

### Available presets

#### Core

| Preset | Description |
|--------|-------------|
| `base` | TypeScript, Import, Depend + type-aware linting. Always include first. |
| `unicorn` | 100+ code quality rules (optional, recommended) |

#### Node.js

| Preset | Description |
|--------|-------------|
| `node` | Node.js specific rules |
| `promise` | Promise best practices (16 rules) |

#### Frameworks

| Preset | Description |
|--------|-------------|
| `react` | React + React Hooks |
| `reactVite` | React + React Hooks + React Refresh (for Vite) |
| `nextjs` | Next.js rules + Core Web Vitals |

#### Quality

| Preset | Description |
|--------|-------------|
| `a11y` | JSX accessibility (WCAG) |
| `jsdoc` | JSDoc validation |

#### Testing

| Preset | Description |
|--------|-------------|
| `vitest` | Vitest best practices, environment-aware |
| `storybook` | Storybook best practices |

#### Configurable (functions)

```ts
import { base, unicorn, tailwind, boundaries } from '@infra-x/code-quality/lint'

export default defineConfig({
  extends: [
    base,
    unicorn,
    tailwind({ entryPoint: 'src/styles/globals.css', rootFontSize: 16 }),
    boundaries({
      elements: [
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'shared', pattern: 'src/shared/*' },
      ],
      rules: [
        { from: 'shared', allow: ['shared'] },
        { from: 'feature', allow: ['shared', 'feature'] },
      ],
    }),
  ],
})
```

## Format (Oxfmt)

Create `oxfmt.config.ts`:

```ts
import { format } from '@infra-x/code-quality/format'
import { defineConfig } from 'oxfmt'

export default defineConfig({ ...format })
```

### Defaults

| Option | Value |
|--------|-------|
| `semi` | `false` |
| `singleQuote` | `true` |
| `trailingComma` | `all` |
| `printWidth` | `100` |
| `tabWidth` | `2` |
| Import sorting | Grouped with newlines |
| Package.json sorting | Enabled |

### Override

```ts
export default defineConfig({
  ...format,
  printWidth: 120,
  semi: true,
})
```

### Tailwind class sorting

```ts
import { format, tailwindFormat } from '@infra-x/code-quality/format'

export default defineConfig({
  ...format,
  ...tailwindFormat({ stylesheet: 'src/styles/globals.css' }),
})
```

## Scripts

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write",
    "format:check": "oxfmt --check"
  }
}
```

## License

MIT

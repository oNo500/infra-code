# Project Presets

Each preset includes three files. All tsconfig files extend from `@infra-x/typescript-config`.

---

## Vite + React

### tsconfig.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json",
  "include": ["src"]
}
```

### tsconfig.config.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.config.json",
  "include": ["*.config.ts", "*.config.mts"]
}
```

### eslint.config.mts
```typescript
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: true,
  prettier: true,
})
```

---

## Next.js

### tsconfig.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.nextjs.json",
  "include": ["src", "next.config.ts"]
}
```

### tsconfig.config.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.config.json",
  "include": ["*.config.ts", "*.config.mts"]
}
```

### eslint.config.mts
```typescript
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  nextjs: true,
  imports: true,
  prettier: true,
})
```

Optional: add `tailwind: true` if using Tailwind CSS.

---

## Node.js Library

### tsconfig.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.library.json",
  "include": ["src"]
}
```

### tsconfig.config.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.config.json",
  "include": ["*.config.ts", "*.config.mts"]
}
```

### eslint.config.mts
```typescript
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: true,
})
```

---

## React Component Library

### tsconfig.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.react-library.json",
  "include": ["src"]
}
```

### tsconfig.config.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.config.json",
  "include": ["*.config.ts", "*.config.mts"]
}
```

### eslint.config.mts
```typescript
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: true,
  prettier: true,
})
```

---

## NestJS

### tsconfig.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.nestjs.json",
  "include": ["src"]
}
```

### tsconfig.config.json
```json
{
  "extends": "@infra-x/typescript-config/tsconfig.config.json",
  "include": ["*.config.ts", "*.config.mts"]
}
```

### eslint.config.mts
```typescript
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: true,
})
```

---

## Optional Add-ons (any preset)

```typescript
vitest: true,     // Vitest test support
storybook: true,  // Storybook support
```

# apps/web

Minimal frontend starter template for `@workspace/web`, built on Next.js 16 App Router. No database or authentication.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler)
- **Styling**: Tailwind CSS v4
- **Components**: `@workspace/ui` (monorepo internal package)
- **ENV**: `@t3-oss/env-nextjs` + Zod validation
- **Testing**: Vitest + Testing Library

## Included Infrastructure

- Centralized ENV management (`src/config/env.ts`)
- HTTP security response headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Full metadata config (`metadataBase`, Open Graph, Twitter Card)
- Native sitemap (`/sitemap.xml`)
- Skip-navigation accessibility link
- Light/dark theme support

## Getting Started

**Prerequisites**: Node.js 22 (`lts/jod`), pnpm 10.30+

```bash
# Install dependencies from monorepo root
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local

# Start the dev server (http://localhost:3000)
pnpm dev
```

## Key Conventions

### Environment Variables

All environment variables must be declared and validated in `src/config/env.ts`. Import from this module elsewhere — never access `process.env.*` or `import.meta.env.*` directly.

```ts
import { env } from '@/config/env'

env.NEXT_PUBLIC_APP_URL // correct
process.env.NEXT_PUBLIC_APP_URL // forbidden
```

### Path Aliases

Use `@/` for paths within the app. Cross-package paths are configured in `tsconfig.json`.

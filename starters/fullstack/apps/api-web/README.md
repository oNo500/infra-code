# apps/api-web

Full-stack starter template for `@workspace/api-web`, built on Next.js 16 App Router with database and authentication.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler)
- **Styling**: Tailwind CSS v4
- **Components**: `@workspace/ui` (monorepo internal package)
- **ENV**: `@t3-oss/env-nextjs` + Zod validation
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **Testing**: Vitest + Testing Library

## Included Infrastructure

- Centralized ENV management (`src/config/env.ts`)
- HTTP security response headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Full metadata config (`metadataBase`, Open Graph, Twitter Card)
- Native sitemap (`/sitemap.xml`)
- Skip-navigation accessibility link
- Light/dark theme support

## Getting Started

**Prerequisites**: Node.js 22 (`lts/jod`), pnpm 10.30+, PostgreSQL (local or remote)

```bash
# Install dependencies from monorepo root
pnpm install

# Copy and edit environment variables
cp apps/api-web/.env.example apps/api-web/.env.local
# Update DATABASE_URL, BETTER_AUTH_SECRET, etc. for your environment

# Sync database schema
pnpm -F api-web db:push

# Start the dev server (http://localhost:3000)
pnpm dev
```

## Database Commands

```bash
pnpm -F api-web db:generate   # Generate migration files from schema
pnpm -F api-web db:migrate    # Run migrations
pnpm -F api-web db:push       # Push schema directly (dev only, skips migrations)
pnpm -F api-web db:studio     # Open Drizzle Studio (visual database browser)
```

## Key Conventions

### Environment Variables

All environment variables must be declared and validated in `src/config/env.ts`. Import from this module elsewhere — never access `process.env.*` or `import.meta.env.*` directly.

```ts
import { env } from '@/config/env'

env.DATABASE_URL // correct
process.env.DATABASE_URL // forbidden
```

### Path Aliases

Use `@/` for paths within the app. Cross-package paths are configured in `tsconfig.json`.

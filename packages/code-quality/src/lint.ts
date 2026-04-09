/**
 * Oxlint lint presets
 *
 * @example
 * ```ts
 * // oxlint.config.ts
 * import { base, react, vitest } from '@infra-x/code-quality/lint'
 * import { defineConfig } from 'oxlint'
 *
 * export default defineConfig({ extends: [base, unicorn, react, vitest] })
 * ```
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'oxlint'

import { GLOB_JSX, GLOB_TESTS, GLOB_TS, isInEditorEnv } from './utils'

import type { OxlintConfig } from 'oxlint'

// ============================================================================
// Ignore patterns
// ============================================================================

const DEFAULT_IGNORES: string[] = [
  '**/node_modules/**',
  '**/.pnp.*',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.next/**',
  '**/.cache/**',
  '**/.turbo/**',
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/public/**',
  '**/*.d.ts',
]

function loadGitignorePatterns(): string[] {
  const gitignoreFile = path.resolve(process.cwd(), '.gitignore')
  if (!existsSync(gitignoreFile)) return []

  return readFileSync(gitignoreFile, 'utf8')
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((pattern) => {
      let p = pattern.trimEnd()
      if (p.startsWith('/')) p = p.slice(1)
      if (!p.includes('/') && !p.includes('*')) p = `**/${p}`
      if (p.endsWith('/')) p = `${p}**`
      return p
    })
}

// ============================================================================
// Base preset (always needed)
// ============================================================================

/**
 * Base lint preset — enables TypeScript, Import (native), Depend plugins,
 * and type-aware linting via tsgolint. Always include first.
 * Requires `oxlint-tsgolint` (bundled as dependency).
 */
export const base: OxlintConfig = defineConfig({
  plugins: ['typescript', 'import'],
  jsPlugins: ['eslint-plugin-depend'],
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  env: {
    browser: true,
    node: true,
    es2026: true,
    builtin: true,
  },
  ignorePatterns: [...DEFAULT_IGNORES, ...loadGitignorePatterns()],
  rules: {
    // Depend
    'depend/ban-dependencies': ['error', {
      presets: ['native', 'microutilities', 'preferred'],
      modules: [],
      allowed: ['dotenv'],
    }],
  },
  overrides: [
    {
      // TypeScript-specific rules
      files: [GLOB_TS],
      rules: {
        'typescript/ban-ts-comment': 'error',
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-empty-object-type': 'error',
        'typescript/no-explicit-any': 'error',
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-require-imports': 'error',
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-wrapper-object-types': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-namespace-keyword': 'error',
        'typescript/triple-slash-reference': 'error',
        'typescript/adjacent-overload-signatures': 'error',
        'typescript/array-type': 'error',
        'typescript/ban-tslint-comment': 'error',
        'typescript/class-literal-property-style': 'error',
        'typescript/consistent-generic-constructors': 'error',
        'typescript/consistent-indexed-object-style': 'error',
        'typescript/consistent-type-assertions': 'error',
        'typescript/no-confusing-non-null-assertion': 'error',
        'typescript/no-inferrable-types': 'error',
        'typescript/prefer-for-of': 'error',
        'typescript/prefer-function-type': 'error',
        'typescript/consistent-type-definitions': 'off',
        'typescript/consistent-type-imports': 'error',
        'no-unused-vars': 'off',
        'no-empty-function': 'error',
      },
    },
  ],
})

/**
 * Type-aware lint preset — enables 59 type-aware rules via tsgolint + type checking.
 * Requires TypeScript 7.0+ and `oxlint-tsgolint` (bundled as dependency).
 */
export const typeAware: OxlintConfig = defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
})

/** Unicorn lint preset — enables 100+ code quality rules. */
export const unicorn: OxlintConfig = defineConfig({
  plugins: ['unicorn'],
  rules: {
    'unicorn/no-null': 'off',
  },
})

// ============================================================================
// Framework presets
// ============================================================================

/** React lint preset — enables native react + react-hooks plugin. */
export const react: OxlintConfig = defineConfig({
  plugins: ['react'],
})

/**
 * React preset with react-refresh support (for Vite projects).
 * Use instead of `react` when using Vite.
 */
export const reactVite: OxlintConfig = defineConfig({
  plugins: ['react'],
  jsPlugins: ['eslint-plugin-react-refresh'],
})

/** Next.js lint preset — enables native nextjs plugin. */
export const nextjs: OxlintConfig = defineConfig({
  plugins: ['nextjs'],
})

// ============================================================================
// Node.js presets
// ============================================================================

/** Node.js lint preset — enables native node plugin. */
export const node: OxlintConfig = defineConfig({
  plugins: ['node'],
})

/** Promise lint preset — enables native promise plugin (16 rules). */
export const promise: OxlintConfig = defineConfig({
  plugins: ['promise'],
})

// ============================================================================
// Quality presets
// ============================================================================

/** Accessibility lint preset — enables native jsx-a11y plugin. */
export const a11y: OxlintConfig = defineConfig({
  plugins: ['jsx-a11y'],
})

/** JSDoc lint preset — enables native jsdoc plugin. */
export const jsdoc: OxlintConfig = defineConfig({
  plugins: ['jsdoc'],
})

// ============================================================================
// Testing presets
// ============================================================================

/** Vitest lint preset — enables native vitest plugin with test-file scoping. */
export const vitest: OxlintConfig = defineConfig({
  plugins: ['vitest'],
  settings: {
    vitest: { typecheck: true },
  },
  overrides: [
    {
      files: GLOB_TESTS,
      rules: {
        'vitest/expect-expect': 'error',
        'vitest/no-conditional-expect': 'error',
        'vitest/no-identical-title': 'error',
        'vitest/no-import-node-test': 'error',
        'vitest/no-interpolation-in-snapshots': 'error',
        'vitest/no-mocks-import': 'error',
        'vitest/no-standalone-expect': 'error',
        'vitest/valid-describe-callback': 'error',
        'vitest/valid-expect': 'error',
        'vitest/valid-title': 'error',
        'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
        'vitest/prefer-hooks-in-order': 'error',
        'vitest/prefer-lowercase-title': 'error',
        'vitest/no-disabled-tests': isInEditorEnv() ? 'warn' : 'error',
        'vitest/no-focused-tests': isInEditorEnv() ? 'warn' : 'error',

        // Relax rules in test context
        'no-console': 'off',
        'unicorn/no-null': 'off',
        'typescript/ban-ts-comment': 'off',
      },
    },
  ],
})

/** Storybook lint preset — loads eslint-plugin-storybook via jsPlugin. */
export const storybook: OxlintConfig = defineConfig({
  jsPlugins: ['eslint-plugin-storybook'],
})

// ============================================================================
// Configurable presets (functions — need user options)
// ============================================================================

interface TailwindLintOptions {
  entryPoint?: string
  rootFontSize?: number
}

/** Tailwind CSS lint preset — loads eslint-plugin-better-tailwindcss via jsPlugin. */
export function tailwind(options: TailwindLintOptions = {}): OxlintConfig {
  const { entryPoint = 'src/styles/globals.css', rootFontSize = 16 } = options

  return defineConfig({
    jsPlugins: ['eslint-plugin-better-tailwindcss'],
    settings: {
      'better-tailwindcss': { entryPoint, rootFontSize },
    },
    overrides: [
      {
        files: [GLOB_JSX],
        rules: {
          'better-tailwindcss/enforce-consistent-line-wrapping': ['error', { printWidth: 0 }],
          'better-tailwindcss/enforce-canonical-classes': 'error',
        },
      },
    ],
  })
}

interface BoundariesElement {
  type: string
  pattern: string | string[]
  capture?: string[]
  mode?: 'file' | 'folder' | 'full'
}

interface BoundariesRule {
  from: string | string[]
  allow?: (string | [string, Record<string, string>])[]
  disallow?: string[]
  message?: string
}

interface BoundariesLintOptions {
  elements: BoundariesElement[]
  rules: BoundariesRule[]
}

/** Architectural boundaries lint preset — loads eslint-plugin-boundaries via jsPlugin. */
export function boundaries(options: BoundariesLintOptions): OxlintConfig {
  return defineConfig({
    jsPlugins: ['eslint-plugin-boundaries'],
    settings: {
      'boundaries/elements': options.elements,
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: options.rules.map((rule) => ({
            from: Array.isArray(rule.from) ? rule.from : [rule.from],
            allow: rule.allow,
            message: rule.message,
          })),
        },
      ],
    },
  })
}

// ============================================================================
// ORM / Backend presets
// ============================================================================

/**
 * NestJS lint preset — loads @darraghor/eslint-plugin-nestjs-typed via jsPlugin.
 * Covers DI validation, Swagger consistency, decorator bug prevention (19 AST rules).
 * 3 type-aware rules are excluded (require ESLint, not supported in jsPlugin).
 */
export const nestjs: OxlintConfig = defineConfig({
  jsPlugins: [
    { name: 'nestjs-typed', specifier: '@darraghor/eslint-plugin-nestjs-typed' },
  ],
  rules: {
    // DI
    'nestjs-typed/injectable-should-be-provided': 'error',
    'nestjs-typed/provided-injected-should-match-factory-parameters': 'error',
    'nestjs-typed/use-injectable-provided-token': 'error',

    // Swagger
    'nestjs-typed/api-property-matches-property-optionality': 'error',
    'nestjs-typed/controllers-should-supply-api-tags': 'error',
    'nestjs-typed/api-method-should-specify-api-response': 'error',
    'nestjs-typed/api-property-returning-array-should-set-array': 'error',
    'nestjs-typed/api-property-should-have-api-extra-models': 'error',
    'nestjs-typed/api-operation-summary-description-capitalized': 'error',

    // Bug prevention
    'nestjs-typed/param-decorator-name-matches-route-param': 'error',
    'nestjs-typed/validate-nested-of-array-should-set-each': 'error',
    'nestjs-typed/all-properties-are-whitelisted': 'error',
    'nestjs-typed/no-duplicate-decorators': 'error',
    'nestjs-typed/validation-pipe-should-use-forbid-unknown': 'error',
  },
})

/** Drizzle ORM lint preset — loads eslint-plugin-drizzle via jsPlugin. */
export const drizzle: OxlintConfig = defineConfig({
  jsPlugins: ['eslint-plugin-drizzle'],
  rules: {
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',
  },
})

// ============================================================================
// Re-exports
// ============================================================================

export { defineConfig } from 'oxlint'
export { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from './utils'

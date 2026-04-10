/**
 * Oxlint lint presets
 *
 * Every preset is a function that accepts optional overrides, merged via `defu`.
 * User overrides take priority over preset defaults.
 *
 * @example
 * ```ts
 * // oxlint.config.ts
 * import { base, unicorn, react, vitest } from '@infra-x/code-quality/lint'
 * import { defineConfig } from 'oxlint'
 *
 * export default defineConfig({
 *   extends: [base(), unicorn(), react(), vitest()],
 * })
 * ```
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { defu } from 'defu'
import { defineConfig } from 'oxlint'

import { GLOB_JSX, GLOB_SRC, GLOB_TESTS, GLOB_TS, isInEditorEnv } from './utils'

import type { ExternalPluginEntry, OxlintConfig } from 'oxlint'

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
// Helpers
// ============================================================================

function preset(defaults: OxlintConfig, overrides?: Partial<OxlintConfig>): OxlintConfig {
  return defineConfig(defu(overrides ?? {}, defaults))
}

/**
 * Resolve a jsPlugin package name to its absolute path.
 * This allows oxlint to load plugins directly without relying on
 * Node module resolution from the consumer's CWD — fixes pnpm strict mode.
 */
function resolvePlugin(name: string): string {
  try {
    return require.resolve(name)
  } catch {
    // Fallback to package name if resolve fails (e.g. not installed)
    return name
  }
}

function resolvePlugins(plugins: ExternalPluginEntry[]): ExternalPluginEntry[] {
  return plugins.map((p) => {
    if (typeof p === 'string') return resolvePlugin(p)
    return { ...p, specifier: resolvePlugin(p.specifier) }
  })
}

// ============================================================================
// Core
// ============================================================================

/**
 * Base lint preset — enables TypeScript + Import plugins, categories, env, ignores.
 * Always include first. Does NOT include unicorn or depend — add them separately.
 */
export function base(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      plugins: ['typescript', 'import'],
      categories: {
        correctness: 'error',
        suspicious: 'error',
      },
      env: {
        browser: true,
        node: true,
        es2026: true,
        builtin: true,
      },
      ignorePatterns: [...DEFAULT_IGNORES, ...loadGitignorePatterns()],
      overrides: [
        {
          files: [GLOB_TS],
          rules: {
            // Only list rules that DIFFER from categories defaults
            'typescript/consistent-type-definitions': 'off',
            'typescript/consistent-type-imports': 'error',
            'no-unused-vars': 'off',
          },
        },
        {
          files: [GLOB_SRC],
          rules: {
            // CSS/style side-effect imports are standard in all frontend frameworks
            'import/no-unassigned-import': 'off',
          },
        },
      ],
    },
    overrides,
  )
}

/**
 * Type-aware lint preset — enables 59 type-aware rules via tsgolint + type checking.
 * Requires TypeScript 7.0+ and `oxlint-tsgolint` (bundled as dependency).
 */
export function typeAware(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      options: {
        typeAware: true,
        typeCheck: true,
      },
    },
    overrides,
  )
}

/** Unicorn lint preset — enables 100+ code quality rules. */
export function unicorn(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      plugins: ['unicorn'],
      rules: {
        'unicorn/no-null': 'off',
      },
    },
    overrides,
  )
}

/** Dependency optimization — flags packages replaceable with native APIs or micro-utilities. */
export function depend(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      jsPlugins: resolvePlugins(['eslint-plugin-depend']),
      rules: {
        'depend/ban-dependencies': [
          'error',
          {
            presets: ['native', 'microutilities', 'preferred'],
            modules: [],
            allowed: ['dotenv'],
          },
        ],
      },
    },
    overrides,
  )
}

// ============================================================================
// Node.js
// ============================================================================

/** Node.js lint preset — enables native node plugin. */
export function node(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset({ plugins: ['node'] }, overrides)
}

/** Promise lint preset — enables native promise plugin (16 rules). */
export function promise(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset({ plugins: ['promise'] }, overrides)
}

// ============================================================================
// Frameworks
// ============================================================================

/** React lint preset — enables native react + react-hooks plugin. */
export function react(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      plugins: ['react'],
      rules: {
        // Automatic JSX runtime (React 17+) does not require explicit React import
        'react/react-in-jsx-scope': 'off',
      },
    },
    overrides,
  )
}

/** React + react-refresh preset (for Vite projects). Use instead of `react`. */
export function reactVite(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      plugins: ['react'],
      jsPlugins: resolvePlugins(['eslint-plugin-react-refresh']),
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
    overrides,
  )
}

/** Next.js lint preset — enables native nextjs plugin. */
export function nextjs(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset({ plugins: ['nextjs'] }, overrides)
}

// ============================================================================
// Quality
// ============================================================================

/** Accessibility lint preset — enables native jsx-a11y plugin. */
export function a11y(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset({ plugins: ['jsx-a11y'] }, overrides)
}

/** JSDoc lint preset — enables native jsdoc plugin. */
export function jsdoc(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset({ plugins: ['jsdoc'] }, overrides)
}

// ============================================================================
// Testing
// ============================================================================

interface VitestOptions extends Partial<OxlintConfig> {
  /** Test file glob patterns. Replaces the default GLOB_TESTS. */
  files?: string[]
}

/** Vitest lint preset — enables native vitest plugin with test-file scoping. */
export function vitest(options?: VitestOptions): OxlintConfig {
  const { files, ...overrides } = options ?? {}

  return preset(
    {
      plugins: ['vitest'],
      settings: { vitest: { typecheck: true } },
      overrides: [
        {
          files: files ?? GLOB_TESTS,
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
            // Relax in test context
            'vitest/require-mock-type-parameters': 'off',
            'no-console': 'off',
            'unicorn/no-null': 'off',
            'typescript/ban-ts-comment': 'off',
          },
        },
      ],
    },
    overrides,
  )
}

/** Storybook lint preset — loads eslint-plugin-storybook via jsPlugin. */
export function storybook(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset({ jsPlugins: resolvePlugins(['eslint-plugin-storybook']) }, overrides)
}

// ============================================================================
// Tailwind / Boundaries
// ============================================================================

interface TailwindOptions extends Partial<OxlintConfig> {
  entryPoint?: string
  rootFontSize?: number
  /** File glob patterns for tailwind rules. @default GLOB_JSX */
  files?: string[]
}

/** Tailwind CSS lint preset — loads eslint-plugin-better-tailwindcss via jsPlugin. */
export function tailwind(options: TailwindOptions = {}): OxlintConfig {
  const { entryPoint = 'src/styles/globals.css', rootFontSize = 16, files, ...overrides } = options

  return preset(
    {
      jsPlugins: resolvePlugins(['eslint-plugin-better-tailwindcss']),
      settings: { 'better-tailwindcss': { entryPoint, rootFontSize } },
      overrides: [
        {
          files: files ?? [GLOB_JSX],
          rules: {
            'better-tailwindcss/enforce-consistent-line-wrapping': ['error', { printWidth: 0 }],
            'better-tailwindcss/enforce-canonical-classes': 'error',
          },
        },
      ],
    },
    overrides,
  )
}

interface BoundaryElement {
  type: string
  pattern: string | string[]
  capture?: string[]
  mode?: 'file' | 'folder' | 'full'
}

interface BoundaryRule {
  from: string | string[]
  allow?: (string | [string, Record<string, string>])[]
  disallow?: string[]
  message?: string
}

/** Architectural boundaries lint preset — loads eslint-plugin-boundaries via jsPlugin. */
export function boundaries(
  config: {
    elements: BoundaryElement[]
    rules: BoundaryRule[]
  },
  overrides?: Partial<OxlintConfig>,
): OxlintConfig {
  return preset(
    {
      jsPlugins: resolvePlugins(['eslint-plugin-boundaries']),
      settings: { 'boundaries/elements': config.elements },
      rules: {
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            rules: config.rules.map((rule) => ({
              from: Array.isArray(rule.from) ? rule.from : [rule.from],
              allow: rule.allow,
              message: rule.message,
            })),
          },
        ],
      },
    },
    overrides,
  )
}

// ============================================================================
// Backend / ORM
// ============================================================================

/**
 * NestJS lint preset — loads @darraghor/eslint-plugin-nestjs-typed via jsPlugin.
 * Covers DI validation, Swagger consistency, decorator bug prevention (19 AST rules).
 */
export function nestjs(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      jsPlugins: resolvePlugins([
        { name: 'nestjs-typed', specifier: '@darraghor/eslint-plugin-nestjs-typed' },
      ]),
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
    },
    overrides,
  )
}

/** Drizzle ORM lint preset — loads eslint-plugin-drizzle via jsPlugin. */
export function drizzle(overrides?: Partial<OxlintConfig>): OxlintConfig {
  return preset(
    {
      jsPlugins: resolvePlugins(['eslint-plugin-drizzle']),
      rules: {
        'drizzle/enforce-delete-with-where': 'error',
        'drizzle/enforce-update-with-where': 'error',
      },
    },
    overrides,
  )
}

// ============================================================================
// Re-exports
// ============================================================================

export { defineConfig } from 'oxlint'
export { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from './utils'

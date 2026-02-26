/**
 * @workspace/eslint-config
 *
 * 统一 ESLint 配置工具
 *
 * @example
 * ```typescript
 * import { composeConfig } from '@workspace/eslint-config'
 *
 * export default composeConfig({
 *   typescript: { tsconfigRootDir: import.meta.dirname },
 *   react: true,
 *   tailwind: true,
 *   imports: { typescript: true },
 *   prettier: true,
 * })
 * ```
 */

import { defineConfig } from 'eslint/config'
import { configs as tsConfigs, parser as tsParser } from 'typescript-eslint'

import { a11y } from './configs/a11y'
import { tailwind } from './configs/better-tailwindcss'
import { boundaries } from './configs/boundaries'
import { depend } from './configs/depend'
import { ignores } from './configs/ignores'
import { imports } from './configs/imports'
import { javascript } from './configs/javascript'
import { jsdoc } from './configs/jsdoc'
import { nextjs } from './configs/nextjs'
import { packageJson } from './configs/package-json'
import { prettier } from './configs/prettier'
import { react } from './configs/react'
import { storybook } from './configs/storybook'
import { stylistic } from './configs/stylistic'
import { typescript } from './configs/typescript'
import { unicorn } from './configs/unicorn'
import { vitest } from './configs/vitest'

import type {
  A11yOptions,
  BoundariesOptions,
  DependOptions,
  IgnoresOptions,
  ImportsOptions,
  JavaScriptOptions,
  JsdocOptions,
  NextjsOptions,
  PackageJsonOptions,
  PrettierOptions,
  ReactOptions,
  StorybookOptions,
  StylisticOptions,
  TailwindOptions,
  TypeScriptOptions,
  UnicornOptions,
  VitestOptions,
} from './types'
import type { Linter } from 'eslint'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * composeConfig 配置选项
 *
 * 每个配置项支持：
 * - `true` - 使用默认选项
 * - `对象` - 传入自定义选项
 * - `false` - 关闭（默认开启的配置需要显式关闭）
 * - 不写 - 不启用（非默认开启的配置）
 */
export interface ComposeConfigOptions {
  // 基础配置（默认开启）
  /** 忽略文件配置 @default true */
  ignores?: boolean | IgnoresOptions
  /** JavaScript 基础配置 @default true */
  javascript?: boolean | JavaScriptOptions
  /** TypeScript 配置 @default true */
  typescript?: boolean | TypeScriptOptions
  /** 代码风格规则 @default true */
  stylistic?: boolean | StylisticOptions
  /** Unicorn 最佳实践 @default true */
  unicorn?: boolean | UnicornOptions
  /** 依赖优化建议 @default true */
  depend?: boolean | DependOptions
  /** config 文件（*.config.ts）专属规则（不启用类型检查）@default true */
  configFiles?: boolean

  // 框架配置
  /** React 配置 */
  react?: boolean | ReactOptions
  /** Next.js 配置 */
  nextjs?: boolean | NextjsOptions
  /** Tailwind CSS 配置 */
  tailwind?: boolean | TailwindOptions

  // 工具配置
  /** Import 排序和规则 */
  imports?: boolean | ImportsOptions
  /** Prettier 格式化 */
  prettier?: boolean | PrettierOptions

  // 质量配置
  /** 无障碍访问规则 */
  a11y?: boolean | A11yOptions
  /** JSDoc 文档规则 */
  jsdoc?: boolean | JsdocOptions
  /** 模块边界规则 */
  boundaries?: boolean | BoundariesOptions
  /** package.json 规则 */
  packageJson?: boolean | PackageJsonOptions

  // 测试配置
  /** Vitest 测试规则 */
  vitest?: boolean | VitestOptions
  /** Storybook 规则 */
  storybook?: boolean | StorybookOptions
}

// ============================================================================
// 主函数
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConfigFn = (opts: any) => Linter.Config[]

type ConfigEntry = {
  key: keyof ComposeConfigOptions
  fn: ConfigFn
  defaultOn?: boolean
  /** 根据全局 options 派生注入值，优先级低于用户配置 */
  inject?: (options: ComposeConfigOptions) => Record<string, unknown>
}

const CONFIG_REGISTRY: ConfigEntry[] = [
  // 默认开启
  { key: 'ignores', fn: ignores, defaultOn: true },
  { key: 'javascript', fn: javascript, defaultOn: true },
  {
    key: 'typescript',
    fn: typescript,
    defaultOn: true,
  },
  { key: 'stylistic', fn: stylistic, defaultOn: true },
  { key: 'unicorn', fn: unicorn, defaultOn: true },
  { key: 'depend', fn: depend, defaultOn: true },
  // 按需开启（顺序固定，prettier 最后）
  {
    key: 'imports',
    fn: imports,
    inject: (options) => ({ typescript: options.typescript !== false }),
  },
  { key: 'react', fn: react },
  { key: 'nextjs', fn: nextjs },
  { key: 'tailwind', fn: tailwind },
  { key: 'a11y', fn: a11y },
  { key: 'jsdoc', fn: jsdoc },
  { key: 'boundaries', fn: boundaries },
  { key: 'packageJson', fn: packageJson },
  { key: 'vitest', fn: vitest },
  { key: 'storybook', fn: storybook },
  { key: 'prettier', fn: prettier },
]

/** 组合 ESLint 配置，内部按正确顺序组合 */
export function composeConfig(options: ComposeConfigOptions = {}): Linter.Config[] {
  const configs: Linter.Config[] = []

  for (const { key, fn, defaultOn, inject } of CONFIG_REGISTRY) {
    const opt = options[key]
    const enabled = defaultOn ? opt !== false : !!opt
    if (!enabled) continue

    const base = typeof opt === 'object' ? opt : {}
    const injected = inject ? inject(options) : {}
    configs.push(...fn({ ...injected, ...base }))
  }

  return options.configFiles === false
    ? configs
    : defineConfig([
        {
          ignores: ['*.config.ts', '*.config.mts'],
          extends: [configs],
        },
        {
          name: 'typescript/config-files',
          files: ['*.config.ts', '*.config.mts'],
          extends: [tsConfigs.recommended],
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              project: false,
              tsconfigRootDir: (typeof options.typescript === 'object' ? options.typescript.tsconfigRootDir : undefined) ?? process.cwd(),
            },
          },
        },
      ])
}

// ============================================================================
// 类型导出
// ============================================================================

export type {
  A11yOptions,
  BoundariesOptions,
  DependOptions,
  IgnoresOptions,
  ImportsOptions,
  JavaScriptOptions,
  JsdocOptions,
  NextjsOptions,
  PackageJsonOptions,
  PrettierOptions,
  ReactOptions,
  StorybookOptions,
  StylisticOptions,
  TailwindOptions,
  TypeScriptOptions,
  UnicornOptions,
  VitestOptions,
} from './types'

// ============================================================================
// 常量导出
// ============================================================================

export { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from './utils'

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
 *   imports: { typescript: true },
 *   prettier: true,
 * })
 * ```
 */

import { a11y } from './configs/a11y'
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

import type { A11yOptions } from './configs/a11y'
import type { BoundariesOptions } from './configs/boundaries'
import type { DependOptions } from './configs/depend'
import type { IgnoresOptions } from './configs/ignores'
import type { ImportsOptions } from './configs/imports'
import type { JavaScriptOptions } from './configs/javascript'
import type { JsdocOptions } from './configs/jsdoc'
import type { NextjsOptions } from './configs/nextjs'
import type { PackageJsonOptions } from './configs/package-json'
import type { PrettierOptions } from './configs/prettier'
import type { ReactOptions } from './configs/react'
import type { StorybookOptions } from './configs/storybook'
import type { StylisticOptions } from './configs/stylistic'
import type { TypeScriptOptions } from './configs/typescript'
import type { UnicornOptions } from './configs/unicorn'
import type { VitestOptions } from './configs/vitest'
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

  // 框架配置
  /** React 配置 */
  react?: boolean | ReactOptions
  /** Next.js 配置 */
  nextjs?: boolean | NextjsOptions

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

const getOpts = <T>(opt: boolean | T | undefined): T => (typeof opt === 'object' ? opt : {}) as T

/** 组合 ESLint 配置，内部按正确顺序组合 */
export function composeConfig(options: ComposeConfigOptions = {}): Linter.Config[] {
  const configs: Linter.Config[] = []

  // 默认开启
  if (options.ignores !== false) {
    const opts = getOpts(options.ignores)
    configs.push(...ignores(opts.ignores, opts.gitignore))
  }

  if (options.javascript !== false) {
    configs.push(...javascript(getOpts(options.javascript)))
  }

  if (options.typescript !== false) {
    configs.push(...typescript(getOpts(options.typescript)))
  }

  if (options.stylistic !== false) {
    configs.push(...stylistic(getOpts(options.stylistic)))
  }

  if (options.unicorn !== false) {
    configs.push(...unicorn(getOpts(options.unicorn)))
  }

  if (options.depend !== false) {
    configs.push(...depend(getOpts(options.depend)))
  }

  // 需显式开启
  if (options.imports) {
    const enableTypeScript = options.typescript !== false
    configs.push(
      ...imports(
        typeof options.imports === 'object'
          ? { typescript: enableTypeScript, ...options.imports }
          : { typescript: enableTypeScript },
      ),
    )
  }

  if (options.react) {
    configs.push(...react(getOpts(options.react)))
  }

  if (options.nextjs) {
    configs.push(...nextjs(getOpts(options.nextjs)))
  }

  if (options.a11y) {
    configs.push(...a11y(getOpts(options.a11y)))
  }

  if (options.jsdoc) {
    configs.push(...jsdoc(getOpts(options.jsdoc)))
  }

  if (options.boundaries) {
    configs.push(...boundaries(getOpts(options.boundaries)))
  }

  if (options.packageJson) {
    configs.push(...packageJson(getOpts(options.packageJson)))
  }

  if (options.vitest) {
    configs.push(...vitest(getOpts(options.vitest)))
  }

  if (options.storybook) {
    configs.push(...storybook(getOpts(options.storybook)))
  }

  // prettier 必须在最后
  if (options.prettier) {
    configs.push(...prettier(getOpts(options.prettier)))
  }

  return configs
}

// ============================================================================
// 常量导出
// ============================================================================

export { GLOB_SRC, GLOB_JS, GLOB_TS, GLOB_JSX, GLOB_TESTS, GLOB_JSON, GLOB_MARKDOWN } from './utils'

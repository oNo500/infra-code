import type { RulesConfig } from '@eslint/core'

/**
 * 规则覆盖选项
 */
export interface OptionsOverrides {
  /**
   * 自定义规则覆盖
   */
  overrides?: Partial<RulesConfig>
}

/**
 * 风格化选项
 */
export interface OptionsStylistic {
  /**
   * 是否启用风格化规则
   * @default true
   */
  stylistic?: boolean
}

/**
 * 文件匹配选项
 */
export interface OptionsFiles {
  /**
   * 自定义文件匹配模式
   */
  files?: string[]
}

/**
 * TypeScript 配置选项
 */
export interface OptionsTypeScript {
  tsconfigRootDir?: string
}

/**
 * React 配置选项
 */
export interface OptionsReact {
  /**
   * React 版本
   * @default 'detect'
   */
  version?: string
}

/**
 * Tailwind CSS 配置选项
 */
export interface OptionsTailwind {
  /**
   * Tailwind CSS 入口文件路径
   * @default 'src/global.css'
   */
  entryPoint?: string
}

// ============================================================================
// Config Options 类型
// ============================================================================

export type A11yOptions = OptionsFiles & OptionsOverrides

export interface BoundariesOptions extends OptionsFiles, OptionsOverrides {
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
}

export interface DependOptions extends OptionsOverrides {
  /**
   * 预设列表
   *
   * - `native`: 检测可用原生 JavaScript API 替代的包(如 `is-nan` → `Number.isNaN()`)
   * - `microutilities`: 检测微型工具库(一行代码可实现的包)
   * - `preferred`: 推荐更轻量、维护更好的替代方案
   *
   * @default ['native', 'microutilities', 'preferred']
   */
  presets?: ('native' | 'microutilities' | 'preferred')[]

  /**
   * 自定义禁用的模块列表
   * @default []
   */
  modules?: string[]

  /**
   * 允许使用的模块列表(即使在 presets 中)
   * @default []
   */
  allowed?: string[]
}

export interface IgnoresOptions {
  /** 用户自定义忽略规则，传入 false 禁用默认规则 */
  ignores?: string[] | false
  /** gitignore 文件路径或启用标志 */
  gitignore?: string | boolean
}

export interface ImportsOptions extends OptionsOverrides, OptionsStylistic {
  /**
   * 是否启用 TypeScript 支持
   * @default false
   */
  typescript?: boolean
  /**
   * 禁止使用 ../ 父级相对导入
   * @default false
   */
  noRelativeParentImports?: boolean
}

export type JavaScriptOptions = OptionsFiles & OptionsOverrides

export type JsdocOptions = OptionsOverrides

export type NextjsOptions = OptionsOverrides

export interface PackageJsonOptions extends OptionsOverrides {
  /**
   * @default true
   */
  stylistic?: boolean
  /**
   * @default false
   */
  enforceForPrivate?: boolean
}

export type PrettierOptions = OptionsOverrides

export type ReactOptions = OptionsFiles & OptionsOverrides & OptionsReact

export type StorybookOptions = OptionsOverrides

export type StylisticOptions = OptionsOverrides

export type TailwindOptions = OptionsFiles & OptionsOverrides & OptionsTailwind

export type TypeScriptOptions = OptionsFiles & OptionsOverrides & OptionsTypeScript

export type UnicornOptions = OptionsFiles & OptionsOverrides

export type VitestOptions = OptionsFiles & OptionsOverrides & {
  isInEditor?: boolean
}

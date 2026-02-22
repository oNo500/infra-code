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

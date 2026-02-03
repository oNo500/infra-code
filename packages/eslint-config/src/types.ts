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
  /**
   * tsconfig.json 所在的根目录路径
   *
   * **重要提示：强烈建议显式设置此选项！**
   *
   * 如果不设置，TypeScript ESLint 将使用 `process.cwd()` 作为默认值，
   * 这会导致以下问题：
   *
   * 1. **行为不稳定**：ESLint 的行为取决于执行命令的目录位置
   * 2. **多环境不一致**：在不同目录执行 ESLint 会产生不同的结果
   * 3. **IDE 集成问题**：编辑器和命令行的工作目录可能不同，导致类型检查失效
   * 4. **Monorepo 兼容性差**：在 Monorepo 中很难找到正确的 tsconfig.json
   *
   * **推荐用法：**
   * ```typescript
   * // 在 ESLint 配置文件中
   * export default [
   *   ...typescript({
   *     tsconfigRootDir: import.meta.dirname  // ✅ 推荐：使用配置文件所在目录
   *   })
   * ]
   * ```
   *
   * @example
   * ```typescript
   * // ✅ 推荐：显式设置为配置文件所在目录
   * typescript({
   *   tsconfigRootDir: import.meta.dirname
   * })
   *
   * // ❌ 不推荐：不设置，依赖 process.cwd()（默认行为）
   * typescript({
   *   // tsconfigRootDir 未设置
   * })
   * ```
   */
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

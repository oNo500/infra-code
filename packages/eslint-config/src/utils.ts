/**
 * 工具函数和常量
 */

// ============================================================================
// 环境检测
// ============================================================================

/**
 * 检测是否在 Git Hooks 或 lint-staged 中运行
 */
function isInGitHooksOrLintStaged(): boolean {
  return !!(
    process.env['GIT_PARAMS']
    ?? process.env['VSCODE_GIT_COMMAND']
    ?? process.env['npm_lifecycle_script']?.startsWith('lint-staged')
  )
}

/**
 * 检测是否在编辑器环境中运行
 *
 * 在以下情况返回 false：
 * - CI 环境
 * - Git Hooks
 * - lint-staged
 *
 * 在以下情况返回 true：
 * - VSCode
 * - JetBrains IDE
 * - Vim / Neovim
 */
export function isInEditorEnv(): boolean {
  if (process.env['CI'])
    return false
  if (isInGitHooksOrLintStaged())
    return false
  return !!(
    process.env['VSCODE_PID']
    ?? process.env['VSCODE_CWD']
    ?? process.env['JETBRAINS_IDE']
    ?? process.env['VIM']
    ?? process.env['NVIM']
  )
}

// ============================================================================
// 文件匹配模式 (Globs)
// ============================================================================

/**
 * ESLint 文件匹配模式常量
 *
 * 统一的 glob 模式，确保所有配置使用一致的文件匹配规则
 */

/** 所有 JS/TS 源文件（完整覆盖 ESM/CJS） */
export const GLOB_SRC = '**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'

/** 仅 JavaScript 文件 */
export const GLOB_JS = '**/*.{js,mjs,cjs,jsx}'

/** 仅 TypeScript 文件 */
export const GLOB_TS = '**/*.{ts,mts,cts,tsx}'

/** JSX/TSX 文件（React 相关） */
export const GLOB_JSX = '**/*.{jsx,tsx}'

/** 测试文件 */
export const GLOB_TESTS: string[] = [
  '**/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
  '**/__tests__/**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
]

/** JSON 文件 */
export const GLOB_JSON = '**/*.json'

/** Markdown 文件 */
export const GLOB_MARKDOWN = '**/*.md'

/**
 * Utility functions and constants
 */
import { env, isCI } from 'std-env'

// ============================================================================
// Environment detection
// ============================================================================

function isInGitHooksOrLintStaged(): boolean {
  return !!(env['GIT_PARAMS'] || env['VSCODE_GIT_COMMAND'])
    || env['npm_lifecycle_script']?.startsWith('lint-staged') === true
}

/**
 * Detects whether running in an editor environment
 *
 * Returns false in CI, Git Hooks, or lint-staged.
 * Returns true in VSCode, JetBrains IDE, Vim/Neovim.
 */
export function isInEditorEnv(): boolean {
  if (isCI) return false
  if (isInGitHooksOrLintStaged()) return false
  return !!(env['VSCODE_PID'] || env['VSCODE_CWD'] || env['JETBRAINS_IDE'] || env['VIM'] || env['NVIM'])
}

// ============================================================================
// File matching patterns (Globs)
// ============================================================================

/** All JS/TS source files */
export const GLOB_SRC = '**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'

/** JavaScript files only */
export const GLOB_JS = '**/*.{js,mjs,cjs,jsx}'

/** TypeScript files only */
export const GLOB_TS = '**/*.{ts,mts,cts,tsx}'

/** JSX/TSX files (React-related) */
export const GLOB_JSX = '**/*.{jsx,tsx}'

/** Test files */
export const GLOB_TESTS: string[] = [
  '**/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
  '**/__tests__/**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
]

/** JSON files */
export const GLOB_JSON = '**/*.json'

/** Markdown files */
export const GLOB_MARKDOWN = '**/*.md'

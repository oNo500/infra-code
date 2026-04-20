/**
 * Minimal subset of TypeScript compilerOptions fields we support in the DSL.
 * Keep loose; tsc accepts more than this — we only type-check the common ones.
 */
export interface CompilerOptions {
  strict?: boolean
  target?: string
  module?: string
  moduleResolution?: string
  jsx?: string
  lib?: ArrayField<string>
  types?: ArrayField<string>
  paths?: Record<string, string[]>
  plugins?: ArrayField<{ name: string; [k: string]: unknown }>
  incremental?: boolean
  declaration?: boolean
  declarationMap?: boolean
  sourceMap?: boolean
  noEmit?: boolean
  outDir?: string
  rootDir?: string
  isolatedDeclarations?: boolean
  noPropertyAccessFromIndexSignature?: boolean
  allowJs?: boolean
  [key: string]: unknown
}

export type ArrayMerge = 'append' | 'replace' | 'none'

export interface ArrayControl<T> {
  merge: ArrayMerge
  value?: readonly T[]
}

// 简写：数组 = append，'none' = 清空
export type ArrayField<T> = readonly T[] | 'none' | ArrayControl<T>

export interface LayerInput {
  /** DSL-level extends — inherit from another sibling layer */
  extends?: string
  compilerOptions?: CompilerOptions
  include?: readonly string[]
  exclude?: readonly string[]
  files?: readonly string[]
}

export interface ProfileResult {
  compilerOptions: CompilerOptions
  include?: readonly string[]
  exclude?: readonly string[]
}

/**
 * A Profile is a function that returns its baseline output.
 * Accepting options now keeps the door open for parameterisation (e.g. nextjs({ version })).
 */
export type Profile<Options = void> = (options?: Options) => ProfileResult

export interface DefineTsconfigInput {
  profile?: ProfileResult
  compilerOptions?: CompilerOptions
  include?: readonly string[]
  exclude?: readonly string[]
  layers?: Record<string, LayerInput>
  /** Which layer becomes tsconfig.json. Defaults to 'app' if present, else first declared. */
  primary?: string
  /** References stay as-is — we don't manage cross-package topology. */
  references?: readonly { path: string }[]
}

export interface RenderedTsconfig {
  compilerOptions: CompilerOptions
  include?: readonly string[]
  exclude?: readonly string[]
  files?: readonly string[]
  references?: readonly { path: string }[]
}

export interface RenderedFile {
  filename: string
  content: RenderedTsconfig
}

export interface RenderedConfig {
  files: RenderedFile[]
}

type Target = 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'es2023' | 'es2024' | 'es2025' | 'esnext'
type Module = 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es6' | 'es2015' | 'es2020' | 'es2022' | 'esnext' | 'node16' | 'node18' | 'node20' | 'nodenext' | 'preserve'
type ModuleResolution = 'node10' | 'node' | 'classic' | 'node16' | 'nodenext' | 'bundler'
type Jsx = 'preserve' | 'react-native' | 'react-jsx' | 'react-jsxdev' | 'react'
type ModuleDetection = 'auto' | 'legacy' | 'force'
type NewLine = 'crlf' | 'lf'

/**
 * compilerOptions accepted by the DSL. Enum fields use string literals matching
 * what tsc accepts in tsconfig.json (case-insensitive). Unknown keys are allowed
 * via the index signature and validated at runtime against optionDeclarations.
 */
export interface CompilerOptions {
  target?: Target
  module?: Module
  moduleResolution?: ModuleResolution
  jsx?: Jsx
  moduleDetection?: ModuleDetection
  newLine?: NewLine
  lib?: ArrayField<string>
  types?: ArrayField<string>
  paths?: Record<string, string[]>
  plugins?: ArrayField<{ name: string; [k: string]: unknown }>
  strict?: boolean
  noEmit?: boolean
  declaration?: boolean
  declarationMap?: boolean
  sourceMap?: boolean
  incremental?: boolean
  composite?: boolean
  isolatedDeclarations?: boolean
  isolatedModules?: boolean
  allowJs?: boolean
  checkJs?: boolean
  noImplicitAny?: boolean
  noImplicitReturns?: boolean
  noImplicitThis?: boolean
  noUnusedLocals?: boolean
  noUnusedParameters?: boolean
  noFallthroughCasesInSwitch?: boolean
  noUncheckedIndexedAccess?: boolean
  noPropertyAccessFromIndexSignature?: boolean
  exactOptionalPropertyTypes?: boolean
  noEmitOnError?: boolean
  allowImportingTsExtensions?: boolean
  allowSyntheticDefaultImports?: boolean
  esModuleInterop?: boolean
  experimentalDecorators?: boolean
  emitDecoratorMetadata?: boolean
  skipLibCheck?: boolean
  forceConsistentCasingInFileNames?: boolean
  verbatimModuleSyntax?: boolean
  erasableSyntaxOnly?: boolean
  outDir?: string
  rootDir?: string
  baseUrl?: string
  tsBuildInfoFile?: string
  [key: string]: unknown
}

export type ArrayMerge = 'append' | 'replace' | 'none'

export interface ArrayControl<T> {
  merge: ArrayMerge
  value?: readonly T[]
}

// Shorthand: array = append, 'none' = clear
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

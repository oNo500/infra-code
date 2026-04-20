type Target =
  | 'es3'
  | 'es5'
  | 'es6'
  | 'es2015'
  | 'es2016'
  | 'es2017'
  | 'es2018'
  | 'es2019'
  | 'es2020'
  | 'es2021'
  | 'es2022'
  | 'es2023'
  | 'es2024'
  | 'es2025'
  | 'esnext'
type Module =
  | 'none'
  | 'commonjs'
  | 'amd'
  | 'system'
  | 'umd'
  | 'es6'
  | 'es2015'
  | 'es2020'
  | 'es2022'
  | 'esnext'
  | 'node16'
  | 'node18'
  | 'node20'
  | 'nodenext'
  | 'preserve'
type ModuleResolution = 'node10' | 'node' | 'classic' | 'node16' | 'nodenext' | 'bundler'
type Jsx = 'preserve' | 'react-native' | 'react-jsx' | 'react-jsxdev' | 'react'
type ModuleDetection = 'auto' | 'legacy' | 'force'
type NewLine = 'crlf' | 'lf'

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

export type ArrayField<T> = readonly T[] | 'none' | ArrayControl<T>

export interface ViewInput {
  name: string
  compilerOptions?: CompilerOptions
  include?: readonly string[]
  exclude?: readonly string[]
}

export interface RenderInput {
  compilerOptions: CompilerOptions
  include?: readonly string[]
  exclude?: readonly string[]
  views?: ViewInput[]
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

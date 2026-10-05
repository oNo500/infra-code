import type { CompilerOptions } from '@infra-x/tsconfig-presets'

export type {
  ArrayControl,
  ArrayField,
  ArrayMerge,
  CompilerOptions,
  RenderInput,
  ViewInput,
} from '@infra-x/tsconfig-presets'

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

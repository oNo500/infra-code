export { defineTsconfig, renderToString } from './define'
export { mergeCompilerOptions } from './merge'
export { nextjs } from './profiles/nextjs'
export { viteReact } from './profiles/vite-react'
export { libNode } from './profiles/lib-node'
export { libReact } from './profiles/lib-react'
export { appBun } from './profiles/app-bun'
export { appNestjs } from './profiles/app-nestjs'
export type {
  ArrayControl,
  ArrayField,
  ArrayMerge,
  CompilerOptions,
  DefineTsconfigInput,
  LayerInput,
  Profile,
  ProfileResult,
  RenderedConfig,
  RenderedFile,
  RenderedTsconfig,
} from './types'

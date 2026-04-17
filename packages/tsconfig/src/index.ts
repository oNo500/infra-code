export { defineTsconfig, renderToString } from './define'
export { mergeCompilerOptions } from './merge'
export { checkAgainstDisk, syncToDisk } from './sync'
export { explainTsconfig, renderExplain } from './explain'
export { nextjs } from './profiles/nextjs'
export { viteReact } from './profiles/vite-react'
export { libNode } from './profiles/lib-node'
export { libReact } from './profiles/lib-react'
export { appBun } from './profiles/app-bun'
export { appNestjs } from './profiles/app-nestjs'
export type {
  ArrayField,
  ArrayVerb,
  CompilerOptions,
  DefineTsconfigInput,
  LayerInput,
  Profile,
  ProfileResult,
  RenderedConfig,
  RenderedFile,
  RenderedTsconfig,
} from './types'
export type { ExplainedConfig, ExplainedLayer, RenderExplainOptions } from './explain'

export { defineTsconfig, renderToString } from './define'
export { mergeCompilerOptions } from './merge'
export { checkAgainstDisk, syncToDisk } from './sync'
export { explainTsconfig, renderExplain } from './explain'
export { parsePathsArg, runInit } from './init'
export { PROFILES, findProfile } from './profiles/registry'
export { renderConfigTemplate } from './template'
export { nextjs } from './profiles/nextjs'
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
export type { FieldProvenance, Provenance, Source } from './provenance'

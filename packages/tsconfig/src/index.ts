export { renderConfig, fileToString } from './render'
export { mergeCompilerOptions } from './merge'
export {
  base,
  runtimeNode,
  runtimeBun,
  runtimeBrowser,
  runtimeEdge,
  buildBundler,
  buildTscEmit,
  projectLib,
  frameworkReact,
  frameworkNextjs,
  frameworkNestjs,
  composeAtoms,
} from './atoms'
export type {
  ArrayControl,
  ArrayField,
  ArrayMerge,
  CompilerOptions,
  RenderInput,
  ViewInput,
  RenderedConfig,
  RenderedFile,
  RenderedTsconfig,
} from './types'

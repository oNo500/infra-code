import {
  base,
  buildBundler,
  composeAtoms,
  frameworkReact,
  runtimeBrowser,
  runtimeNode,
} from './atoms'
import { renderConfig } from './render'

import type { CompilerOptions, RenderedConfig } from './types'

export type ElectronFramework = 'none' | 'react'

/** Independent type environments; this recipe does not configure Electron's runtime or bundler. */
export function electronViteConfig(framework: ElectronFramework = 'none'): RenderedConfig {
  if (framework !== 'none' && framework !== 'react') {
    throw new Error('electron-vite framework must be none or react')
  }

  const processOptions = (name: string, runtime: CompilerOptions): CompilerOptions =>
    composeAtoms(base(), runtime, buildBundler(), {
      composite: true,
      tsBuildInfoFile: `./node_modules/.cache/tsconfig.${name}.tsbuildinfo`,
    })

  const node = processOptions('node', composeAtoms(runtimeNode(), runtimeBrowser()))
  node.types = ['node', 'electron-vite/node']
  const renderer = processOptions('renderer', runtimeBrowser())
  renderer.types = ['vite/client']
  if (framework === 'react') Object.assign(renderer, frameworkReact())

  return renderConfig({
    compilerOptions: {},
    files: [],
    references: [{ path: './tsconfig.node.json' }, { path: './tsconfig.renderer.json' }],
    views: [
      {
        name: 'node',
        compilerOptions: node,
        include: ['src/main/**/*', 'src/preload/**/*', 'electron.vite.config.ts'],
      },
      { name: 'renderer', compilerOptions: renderer, include: ['src/renderer/**/*'] },
    ],
  })
}

import { electronViteInput } from '@infra-x/tsconfig-presets'

import { renderConfig } from './render'

import type { RenderedConfig } from './types'
import type { ElectronFramework } from '@infra-x/tsconfig-presets'

export type { ElectronFramework } from '@infra-x/tsconfig-presets'

/** Render the shared recipe without changing the generator's public API. */
export function electronViteConfig(framework: ElectronFramework = 'none'): RenderedConfig {
  return renderConfig(electronViteInput(framework))
}

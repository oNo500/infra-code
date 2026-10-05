import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['src/lint.ts', 'src/format.ts', 'src/electron-plugin.ts'],
  format: ['esm'],
  exports: { exclude: ['electron-plugin'] },
  dts: { eager: true },
})

export default config

import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['src/lint.ts', 'src/format.ts'],
  format: ['esm'],
  exports: true,
  dts: { eager: true },
})

export default config

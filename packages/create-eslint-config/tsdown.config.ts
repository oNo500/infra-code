import { defineConfig } from 'tsdown'
import { cp } from 'node:fs/promises'
import { join } from 'node:path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  exports: true,
  dts: false,
  hooks: {
    'build:done': async () => {
      const src = join(import.meta.dirname, '../eslint-config-source')
      const dest = join(import.meta.dirname, 'dist/template')
      await cp(src, dest, {
        recursive: true,
        filter: (src) => !src.includes('node_modules'),
      })
    },
  },
})

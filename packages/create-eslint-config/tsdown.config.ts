import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  exports: true,
  dts: false,
  hooks: {
    'build:done': async () => {
      const src = join(import.meta.dirname, '../eslint-config')
      const dest = join(import.meta.dirname, 'dist/template')
      await cp(src, dest, {
        recursive: true,
        filter: (source) =>
          !source.includes('node_modules')
          && !source.includes('/dist')
          && !source.endsWith('tsdown.config.ts'),
      })

      const [templatePkg, eslintConfigPkg] = await Promise.all([
        readFile(join(import.meta.dirname, 'template.package.json'), 'utf8').then(JSON.parse),
        readFile(join(import.meta.dirname, '../eslint-config/package.json'), 'utf8').then(JSON.parse),
      ])

      const pkg = {
        ...templatePkg,
        dependencies: eslintConfigPkg.dependencies,
        peerDependencies: eslintConfigPkg.peerDependencies,
      }

      await writeFile(join(dest, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
    },
  },
})

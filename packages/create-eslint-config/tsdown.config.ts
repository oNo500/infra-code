import { defineConfig } from 'tsdown'
import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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
        filter: (source) => !source.includes('node_modules') && !source.includes('/dist'),
      })

      const pkgPath = join(dest, 'package.json')
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

      pkg.name = '@workspace/eslint-config'

      const devDepsToRemove = ['@workspace/typescript-config', 'bumpp', 'tsdown']
      for (const dep of devDepsToRemove) {
        delete pkg.devDependencies?.[dep]
      }

      await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    },
  },
})

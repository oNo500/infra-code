import { afterAll, describe, expect, it } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

// oxlint-disable-next-line import/no-relative-parent-imports -- Tests exercise source before package builds.
import { base, electron, reactVite } from '../src/lint'

import type { OxlintConfig } from 'oxlint'

const fixtureRoots: string[] = []
const oxlint =
  process.env['CODE_QUALITY_OXLINT_BIN'] ??
  resolve(import.meta.dir, '../../../node_modules/.bin/oxlint')

afterAll(() => {
  for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true })
})

function runLint(
  files: Record<string, string>,
  config: OxlintConfig = {},
  rootConfig: OxlintConfig = {},
) {
  const root = mkdtempSync(join(tmpdir(), 'code-quality-electron-'))
  fixtureRoots.push(root)
  for (const [filename, content] of Object.entries(files)) {
    const target = join(root, filename)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  const baseline = base({
    categories: { correctness: 'off', suspicious: 'off', perf: 'off', pedantic: 'off' },
  })
  writeFileSync(
    join(root, 'oxlint.config.mjs'),
    `export default ${JSON.stringify({ extends: [baseline, config], ...rootConfig })}`,
  )
  const result = Bun.spawnSync([oxlint, '--config', 'oxlint.config.mjs', '--format', 'json', '.'], {
    cwd: root,
  })
  const output = result.stdout.toString() + result.stderr.toString()
  return {
    exitCode: result.exitCode,
    output,
    diagnostics: JSON.parse(result.stdout.toString()).diagnostics,
  }
}

describe('electron process boundaries', () => {
  it('rejects Node globals in renderer JavaScript and TypeScript', () => {
    const result = runLint(
      {
        'src/renderer/app.js':
          'console.log(process.platform, Buffer.from("x"), require("example"))',
        'src/renderer/app.ts':
          'console.log(__dirname, __filename, global, module, exports, setImmediate, clearImmediate)',
      },
      electron(),
    )

    expect(result.exitCode).toBe(1)
    expect(
      result.diagnostics.filter((item: { code: string }) =>
        item.code.includes('no-restricted-globals'),
      ),
    ).toHaveLength(10)
  })

  it('allows Node and Electron imports in main without browser globals', () => {
    const valid = runLint(
      {
        'src/main/app.ts':
          'import { app } from "electron"; import { readFileSync } from "node:fs"; console.log(app, readFileSync, process.platform, __dirname)',
      },
      electron(),
    )
    expect(valid.exitCode).toBe(0)
    expect(valid.diagnostics).toEqual([])

    const invalid = runLint({ 'src/main/app.js': 'console.log(window, document)' }, electron())
    expect(invalid.exitCode).toBe(1)
    expect(invalid.output).toContain('no-undef')
  })

  it('allows the preload subset but rejects other Node globals and builtins', () => {
    const valid = runLint(
      {
        'src/preload/app.ts':
          'import { contextBridge } from "electron"; console.log(contextBridge, window, global, process, require)',
      },
      electron(),
    )
    expect(valid.exitCode).toBe(0)
    expect(valid.diagnostics).toEqual([])

    const invalid = runLint(
      {
        'src/preload/app.js':
          'import { readFileSync } from "node:fs"; console.log(readFileSync, __dirname, __filename, module, exports, Buffer, setImmediate, clearImmediate)',
      },
      electron(),
    )
    expect(invalid.exitCode).toBe(1)
    expect(invalid.output).toContain('no-nodejs-modules')
    expect(
      invalid.diagnostics.filter((item: { code: string }) =>
        item.code.includes('no-restricted-globals'),
      ),
    ).toHaveLength(7)
  })

  it('rejects static Electron runtime imports and re-exports in renderer', () => {
    const result = runLint(
      {
        'src/renderer/import.js':
          'import { ipcRenderer } from "electron"; console.log(ipcRenderer)',
        'src/renderer/export.ts': 'export { ipcRenderer } from "electron/renderer"',
        'src/renderer/type.ts':
          'import type { IpcRendererEvent } from "electron"; export type Event = IpcRendererEvent',
        'src/renderer/type-export.ts': 'export type { BrowserWindow } from "electron/main"',
      },
      electron(),
    )
    expect(result.exitCode).toBe(1)
    expect(
      result.diagnostics.filter((item: { code: string }) =>
        item.code.includes('no-restricted-imports'),
      ),
    ).toHaveLength(4)
  })

  it('rejects literal dynamic Electron imports in renderer JS and TS only', () => {
    const result = runLint(
      {
        'src/renderer/import.js': 'void import("electron")',
        'src/renderer/subpath.ts': 'void import("electron/renderer")',
        'src/renderer/template.js': 'void import(`electron`)',
        'src/main/import.ts': 'void import("electron/main")',
        'src/preload/import.js': 'void import("electron")',
      },
      electron(),
    )
    expect(result.exitCode).toBe(1)
    expect(
      result.diagnostics.filter((item: { code: string }) => item.code.includes('infra-electron')),
    ).toHaveLength(3)
  })

  it('allows browser code with independently declared bridge types in renderer', () => {
    const result = runLint(
      {
        'src/renderer/bridge.ts': 'export interface AppBridge { ping(): Promise<string> }',
        'src/renderer/app.ts':
          'import type { AppBridge } from "./bridge"; const bridge: AppBridge = window.bridge; console.log(bridge, window, document, navigator)',
        'src/renderer/app.js': 'void import("example"); console.log(window.location.href)',
      },
      electron(),
    )
    expect(result.exitCode).toBe(0)
    expect(result.diagnostics).toEqual([])
  })

  it('rejects Node builtin imports across static, export, require, dynamic and type forms', () => {
    const result = runLint(
      {
        'src/renderer/bare.js': 'import { readFileSync } from "fs"; console.log(readFileSync)',
        'src/renderer/prefix.ts':
          'import { readFileSync } from "node:fs"; console.log(readFileSync)',
        'src/renderer/export.js': 'export { readFileSync } from "fs"',
        'src/renderer/require.js': 'console.log(require("node:fs"))',
        'src/renderer/dynamic.ts': 'void import("node:fs")',
        'src/renderer/type.ts': 'export type { Stats } from "fs"',
        'src/preload/dynamic.ts': 'void import("node:fs")',
        'src/preload/require.js': 'console.log(require("fs"))',
      },
      electron(),
    )
    expect(result.exitCode).toBe(1)
    expect(
      result.diagnostics.filter((item: { code: string }) =>
        item.code.includes('no-nodejs-modules'),
      ),
    ).toHaveLength(8)
  })

  it('replaces all three default file scopes when custom globs are given', () => {
    const result = runLint(
      {
        'src/main/default.js': 'console.log(window)',
        'src/preload/default.js': 'console.log(__dirname)',
        'src/renderer/default.js': 'console.log(process)',
        'desktop/main/app.js': 'console.log(process)',
        'desktop/preload/app.js': 'console.log(process, require, global, window)',
        'desktop/renderer/app.js': 'console.log(document)',
      },
      electron({
        mainFiles: ['desktop/main/**'],
        preloadFiles: ['desktop/preload/**'],
        rendererFiles: ['desktop/renderer/**'],
      }),
    )
    expect(result.exitCode).toBe(0)
    expect(result.diagnostics).toEqual([])

    const invalid = runLint(
      {
        'desktop/main/app.js': 'console.log(window)',
        'desktop/preload/app.js': 'console.log(__dirname)',
        'desktop/renderer/app.js': 'console.log(process)',
      },
      electron({
        mainFiles: ['desktop/main/**'],
        preloadFiles: ['desktop/preload/**'],
        rendererFiles: ['desktop/renderer/**'],
      }),
    )
    expect(invalid.exitCode).toBe(1)
    expect(invalid.output).toContain('no-undef')
    expect(
      invalid.diagnostics.filter((item: { code: string }) =>
        item.code.includes('no-restricted-globals'),
      ),
    ).toHaveLength(2)
  })

  it('lets shared rule options replace defaults and explicit file overrides win last', () => {
    const result = runLint(
      {
        'src/preload/app.ts': 'import { readFileSync } from "fs"; console.log(readFileSync)',
        'src/renderer/legacy.js': 'void import("electron"); console.log(require("electron"))',
      },
      electron({
        rules: { 'import/no-nodejs-modules': ['error', { allow: ['fs'] }] },
        overrides: [
          {
            files: ['src/renderer/legacy.js'],
            globals: { require: 'readonly' },
            rules: { 'no-restricted-globals': 'off', 'infra-electron/no-electron-runtime': 'off' },
          },
        ],
      }),
    )
    expect(result.exitCode).toBe(0)
    expect(result.diagnostics).toEqual([])
  })

  it('combines renderer-scoped React plugins with all Electron import checks', () => {
    const rendererReact = reactVite()
    const rendererFiles = ['src/renderer/**']
    const config = electron({
      rendererFiles: [...rendererFiles, 'src/shared/**/*.d.ts'],
      overrides: [
        {
          files: rendererFiles,
          plugins: ['typescript', 'import', ...(rendererReact.plugins ?? [])],
          jsPlugins: rendererReact.jsPlugins,
          rules: rendererReact.rules,
        },
      ],
    })
    const valid = runLint(
      {
        'src/renderer/app.tsx': 'const view = <button disabled />; console.log(view)',
        'src/main/app.ts': 'import { readFileSync } from "node:fs"; console.log(readFileSync)',
      },
      config,
      { ignorePatterns: config.ignorePatterns },
    )
    expect(valid.exitCode).toBe(0)
    expect(valid.diagnostics).toEqual([])

    const invalid = runLint(
      {
        'src/renderer/app.tsx':
          'import { readFileSync } from "fs"; const view = <button disabled={true} />; console.log(readFileSync, view); void import("electron")',
      },
      config,
      { ignorePatterns: config.ignorePatterns },
    )
    expect(invalid.exitCode).toBe(1)
    expect(invalid.output).toContain('no-nodejs-modules')
    expect(invalid.output).toContain('jsx-boolean-value')
    expect(invalid.output).toContain('infra-electron')
  })

  it('lints renderer and shared bridge declarations without re-enabling generated files', () => {
    const config = electron()
    const rootConfig = { ignorePatterns: config.ignorePatterns ?? base().ignorePatterns }
    const valid = runLint(
      {
        'src/renderer/bridge.d.ts':
          '// oxlint-disable-next-line import/no-relative-parent-imports -- Shared bridge declaration has no runtime imports.\nimport type { AppBridge } from "../shared/bridge"; declare global { interface Window { bridge: AppBridge } }; export {}',
        'src/shared/bridge.d.ts': 'export interface AppBridge { ping(): Promise<string> }',
        'src/shared/unrelated.ts': 'console.log(process)',
        'src/renderer/dist/ignored.d.ts': 'export interface {',
        'src/renderer/node_modules/example/ignored.d.ts': 'export interface {',
        'src/other/ignored.d.ts': 'export interface {',
      },
      config,
      rootConfig,
    )
    expect(valid.diagnostics).toEqual([])
    expect(valid.exitCode).toBe(0)

    const invalid = runLint(
      {
        'src/renderer/bridge.d.ts':
          'import type { IpcRendererEvent } from "electron"; export interface AppBridge { event: IpcRendererEvent }',
        'src/shared/bridge.d.ts':
          'import type { Stats } from "node:fs"; export interface AppBridge { stat: Stats }',
        'src/renderer/app.ts': 'console.log(window)',
      },
      config,
      rootConfig,
    )
    expect(invalid.exitCode).toBe(1)
    expect(invalid.output).toContain('no-restricted-imports')
    expect(invalid.output).toContain('no-nodejs-modules')
  })

  it('checks renderer and shared declarations through ordinary extends composition', () => {
    const result = runLint(
      {
        'src/renderer/bridge.d.ts': 'export type { IpcRendererEvent } from "electron"',
        'src/shared/bridge.d.ts': 'export type { Stats } from "node:fs"',
        'src/shared/runtime.ts': 'console.log(process)',
      },
      electron(),
    )
    expect(result.exitCode).toBe(1)
    expect(result.output).toContain('no-restricted-imports')
    expect(result.output).toContain('no-nodejs-modules')
  })

  it('loads the local plugin from an npm package containing only published files', () => {
    const root = mkdtempSync(join(tmpdir(), 'code-quality-published-'))
    fixtureRoots.push(root)
    const packageRoot = resolve(import.meta.dir, '..')
    const packed = Bun.spawnSync(
      ['npm', 'pack', '--ignore-scripts', '--json', '--pack-destination', root],
      { cwd: packageRoot },
    )
    expect(packed.exitCode).toBe(0)
    const [{ filename }] = JSON.parse(packed.stdout.toString())
    const installRoot = join(root, 'node_modules/@infra-x/code-quality')
    mkdirSync(installRoot, { recursive: true })
    const extracted = Bun.spawnSync([
      'tar',
      '-xzf',
      join(root, filename),
      '-C',
      installRoot,
      '--strip-components=1',
    ])
    expect(extracted.exitCode).toBe(0)
    for (const dependency of ['defu', 'oxlint', 'std-env']) {
      symlinkSync(
        join(packageRoot, 'node_modules', dependency),
        join(root, 'node_modules', dependency),
      )
    }
    mkdirSync(join(root, 'src/renderer/dist'), { recursive: true })
    mkdirSync(join(root, 'src/shared'), { recursive: true })
    writeFileSync(join(root, 'src/renderer/app.js'), 'void import("electron")')
    writeFileSync(join(root, 'src/shared/bridge.d.ts'), 'export type { Stats } from "node:fs"')
    writeFileSync(join(root, 'src/renderer/dist/ignored.d.ts'), 'export interface {')
    writeFileSync(
      join(root, 'oxlint.config.mjs'),
      'import { base, electron } from "@infra-x/code-quality/lint"; const processConfig = electron(); export default { extends: [base(), processConfig], ignorePatterns: processConfig.ignorePatterns }',
    )
    const result = Bun.spawnSync(
      [oxlint, '--config', 'oxlint.config.mjs', '--format', 'json', 'src'],
      { cwd: root },
    )
    const output = result.stdout.toString() + result.stderr.toString()
    expect(output).toContain('infra-electron')
    expect(output).toContain('no-nodejs-modules')
    expect(JSON.parse(result.stdout.toString()).diagnostics).toHaveLength(2)
    expect(result.exitCode).toBe(1)
  })
})

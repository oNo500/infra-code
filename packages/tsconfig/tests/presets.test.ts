import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

function run(command: string[], cwd: string) {
  const result = Bun.spawnSync(command, { cwd })
  return {
    exitCode: result.exitCode,
    output: result.stdout.toString() + result.stderr.toString(),
  }
}

it('renders shared Electron input through the generator dependency', () => {
  const result = Bun.spawnSync(
    [
      process.execPath,
      '-e',
      `import { electronViteInput } from '@infra-x/tsconfig-presets';
       import { renderConfig } from './src/render.ts';
       console.log(JSON.stringify(renderConfig(electronViteInput('react'))));`,
    ],
    { cwd: resolve(import.meta.dir, '..') },
  )
  expect(result.stderr.toString()).toBe('')
  expect(result.exitCode).toBe(0)
  const { files } = JSON.parse(result.stdout.toString())
  expect(files.map((file: { filename: string }) => file.filename)).toEqual([
    'tsconfig.json',
    'tsconfig.node.json',
    'tsconfig.renderer.json',
  ])
  expect(files[0].content.references).toEqual([
    { path: './tsconfig.node.json' },
    { path: './tsconfig.renderer.json' },
  ])
  expect(files[1].content.compilerOptions.types).toEqual(['node', 'electron-vite/node'])
  expect(files[2].content.compilerOptions.types).toEqual(['vite/client'])
  expect(files[2].content.compilerOptions.jsx).toBe('react-jsx')
})

describe('packed generator', () => {
  const consumer = mkdtempSync(join(tmpdir(), 'tsconfig-presets-consumer-'))
  const packageRoot = resolve(import.meta.dir, '..')
  const compiler = join(consumer, 'node_modules/typescript/bin/tsc')

  function write(filename: string, content: string) {
    const path = join(consumer, filename)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }

  function generate(directory: string, args: string[]) {
    mkdirSync(join(consumer, directory), { recursive: true })
    return run(
      [join(consumer, 'node_modules/.bin/tsconfig'), '--cwd', join(consumer, directory), ...args],
      consumer,
    )
  }

  function readConfig(directory: string, filename = 'tsconfig.json') {
    const text = readFileSync(join(consumer, directory, filename), 'utf8')
    return JSON.parse(text.slice(text.indexOf('{')))
  }

  beforeAll(() => {
    const packed = run(
      ['npm', 'pack', '--ignore-scripts', '--json', '--pack-destination', consumer],
      packageRoot,
    )
    expect(packed.exitCode).toBe(0)
    const [{ filename }] = JSON.parse(packed.output)
    write(
      'package.json',
      JSON.stringify({
        type: 'module',
        dependencies: { '@infra-x/tsconfig': `file:./${filename}` },
        devDependencies: {
          typescript: `file:${resolve(packageRoot, '../../node_modules/typescript')}`,
        },
      }),
    )
    const installed = run([process.execPath, 'install', '--ignore-scripts'], consumer)
    expect(installed.exitCode).toBe(0)
    expect(existsSync(join(consumer, 'node_modules/@infra-x/tsconfig-presets'))).toBe(false)
    expect(existsSync(join(consumer, 'node_modules/.bin/tsconfig'))).toBe(true)
  }, 60_000)

  afterAll(() => {
    rmSync(consumer, { recursive: true, force: true })
  })

  it('installs shared presets without an adjacent source repository', () => {
    const checkout = join(consumer, 'checkout')
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
    write(
      'checkout/package.json',
      JSON.stringify({
        type: 'module',
        devDependencies: {
          '@infra-x/tsconfig-presets': manifest.devDependencies['@infra-x/tsconfig-presets'],
        },
      }),
    )
    const vendor = join(packageRoot, 'vendor')
    if (existsSync(vendor)) cpSync(vendor, join(checkout, 'vendor'), { recursive: true })
    const installed = run([process.execPath, 'install', '--ignore-scripts'], checkout)
    expect(installed).toMatchObject({ exitCode: 0 })
    const imported = run(
      [
        'node',
        '--input-type=module',
        '-e',
        "import { base } from '@infra-x/tsconfig-presets'; console.log(base().strict)",
      ],
      checkout,
    )
    expect(imported).toEqual({ exitCode: 0, output: 'true\n' })
  }, 60_000)

  it('generates a browser project using only the installed tarball', () => {
    const result = generate('browser', [
      '--runtime',
      'browser',
      '--module',
      'bundler',
      '--framework',
      'react',
    ])
    expect(result.output).toContain('tsconfig.json')
    expect(result.exitCode).toBe(0)
    const config = readConfig('browser')
    expect(config.compilerOptions.jsx).toBe('react-jsx')
    expect(config.compilerOptions.lib).toEqual(['esnext', 'DOM', 'DOM.Iterable'])
    write('browser/app.ts', 'export const title: string = document.title\n')
    const checked = run(['node', compiler, '-p', join(consumer, 'browser/tsconfig.json')], consumer)
    expect(checked.output).toBe('')
    expect(checked.exitCode).toBe(0)
  })

  it('builds Electron projects and keeps Node globals out of renderer', () => {
    const args = ['--preset', 'electron-vite', '--framework', 'react']
    const result = generate('electron', args)
    expect(result.exitCode).toBe(0)
    expect(readConfig('electron').references).toEqual([
      { path: './tsconfig.node.json' },
      { path: './tsconfig.renderer.json' },
    ])
    write('electron/node_modules/@types/node/index.d.ts', 'declare var process: { pid: number }\n')
    write(
      'electron/node_modules/electron-vite/node.d.ts',
      'interface ImportMeta { readonly mainAsset: string }\n',
    )
    write(
      'electron/node_modules/vite/client.d.ts',
      'interface ImportMeta { readonly env: { TOKEN: string } }\n',
    )
    write('electron/src/main/app.ts', 'export const pid = process.pid\n')
    write('electron/src/preload/app.ts', 'export const title = document.title\n')
    write('electron/src/renderer/app.ts', 'export const token = import.meta.env.TOKEN\n')
    const checked = run(
      ['node', compiler, '-b', join(consumer, 'electron/tsconfig.json')],
      consumer,
    )
    expect(checked.output).toBe('')
    expect(checked.exitCode).toBe(0)
    const repeated = generate('electron', args)
    expect(repeated.output).toBe('')
    expect(repeated.exitCode).toBe(0)
    write('electron/src/renderer/forbidden.ts', 'export const pid = process.pid\n')
    const invalid = run(
      ['node', compiler, '-p', join(consumer, 'electron/tsconfig.renderer.json')],
      consumer,
    )
    expect(invalid.exitCode).not.toBe(0)
    expect(invalid.output).toContain("Cannot find name 'process'")
  })

  it('exposes standalone declarations for the existing public API', () => {
    write(
      'api.mts',
      `import { base, runtimeNode, composeAtoms, renderConfig, electronViteConfig } from '@infra-x/tsconfig'
      import type { CompilerOptions, RenderInput, RenderedConfig } from '@infra-x/tsconfig'
      const options: CompilerOptions = composeAtoms(base(), runtimeNode())
      const input: RenderInput = { compilerOptions: options }
      export const rendered: RenderedConfig = renderConfig(input)
      export const electron: RenderedConfig = electronViteConfig('react')\n`,
    )
    write(
      'api.tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          module: 'NodeNext',
          target: 'ESNext',
          strict: true,
          noEmit: true,
          types: [],
        },
        files: ['api.mts'],
      }),
    )
    const checked = run(['node', compiler, '-p', 'api.tsconfig.json'], consumer)
    expect(checked.output).toBe('')
    expect(checked.exitCode).toBe(0)
  })

  it('renders scalar none and an alias named merge from the bundled preset', () => {
    write('plain.ts', 'const value: number = 1\nvoid value\n')
    const rendered = run(
      [
        'node',
        '--input-type=module',
        '-e',
        `import assert from 'node:assert/strict';
      import {writeFileSync} from 'node:fs';
      import {renderConfig} from '@infra-x/tsconfig';
        const options={module:'none',moduleDetection:'legacy',ignoreDeprecations:'6.0',noEmit:true,strict:true,types:[],paths:{merge:['./plain.ts']}};
      const {files}=renderConfig({compilerOptions:options,files:['plain.ts']});
      assert.deepEqual(files[0].content.compilerOptions,options);
      writeFileSync('plain.tsconfig.json',JSON.stringify(files[0].content));`,
      ],
      consumer,
    )
    expect(rendered).toEqual({ exitCode: 0, output: '' })
    const checked = run(['node', compiler, '-p', 'plain.tsconfig.json'], consumer)
    expect(checked).toEqual({ exitCode: 0, output: '' })
  })
})

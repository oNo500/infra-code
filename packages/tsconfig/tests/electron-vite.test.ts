import { afterEach, describe, expect, it } from 'bun:test'
import { rejects } from 'node:assert/strict'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

import ts from 'typescript'

import { generate, planGenerate } from '@/generate'

import type { RenderedTsconfig } from '@/types'

const temporaryDirectories: string[] = []
const filenames = ['tsconfig.json', 'tsconfig.node.json', 'tsconfig.renderer.json']

function temporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'tsconfig-electron-vite-'))
  temporaryDirectories.push(directory)
  return directory
}

function readConfig(directory: string, filename: string): RenderedTsconfig {
  const text = readFileSync(join(directory, filename), 'utf8')
  return JSON.parse(text.slice(text.indexOf('{'))) as RenderedTsconfig
}

async function runCli(directory: string, args: string[]) {
  const process = Bun.spawn(
    [Bun.argv[0]!, resolve(import.meta.dir, '../src/cli.ts'), '--cwd', directory, ...args],
    { stdout: 'pipe', stderr: 'pipe' },
  )
  const [exitCode, stdout, stderr] = await Promise.all([
    process.exited,
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
  ])
  return { exitCode, stdout, stderr }
}

function writeFixture(directory: string, filename: string, text: string): void {
  const path = join(directory, filename)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function diagnostics(directory: string, filename: string): ts.Diagnostic[] {
  const config = ts.readConfigFile(join(directory, filename), (path) => ts.sys.readFile(path))
  if (config.error) return [config.error]
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    directory,
    undefined,
    join(directory, filename),
  )
  return [
    ...parsed.errors,
    ...ts.getPreEmitDiagnostics(ts.createProgram(parsed.fileNames, parsed.options)),
  ]
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('electron-vite preset', () => {
  // Main and preload share one environment; renderer must still exclude Node globals.
  it('generates a shared Node project, a renderer project, and a references-only root', async () => {
    const directory = temporaryDirectory()
    const result = await generate({ cwd: directory, preset: 'electron-vite', framework: 'react' })
    expect(result.written.toSorted()).toEqual(filenames.toSorted())

    const root = readConfig(directory, 'tsconfig.json')
    expect(root.compilerOptions).toEqual({})
    expect(root.files).toEqual([])
    expect(root.references).toEqual([
      { path: './tsconfig.node.json' },
      { path: './tsconfig.renderer.json' },
    ])
    expect(root.include).toBeUndefined()

    const node = readConfig(directory, 'tsconfig.node.json')
    const renderer = readConfig(directory, 'tsconfig.renderer.json')
    expect(node.include).toEqual(['src/main/**/*', 'src/preload/**/*', 'electron.vite.config.ts'])
    expect(renderer.include).toEqual(['src/renderer/**/*'])
    expect(node.compilerOptions.lib).toEqual(['esnext', 'DOM', 'DOM.Iterable'])
    expect(node.compilerOptions.types).toEqual(['node', 'electron-vite/node'])
    expect(renderer.compilerOptions.lib).toEqual(['esnext', 'DOM', 'DOM.Iterable'])
    expect(renderer.compilerOptions.types).toEqual(['vite/client'])
    expect(node.compilerOptions.jsx).toBeUndefined()
    expect(renderer.compilerOptions.jsx).toBe('react-jsx')

    for (const config of [node, renderer]) {
      expect(config.compilerOptions.strict).toBe(true)
      expect(config.compilerOptions.composite).toBe(true)
      expect(config.compilerOptions.module).toBe('preserve')
      expect(config.compilerOptions.moduleResolution).toBe('bundler')
      expect(config.compilerOptions.noEmit).toBe(true)
      expect(config.compilerOptions.paths).toBeUndefined()
      expect(config.references).toBeUndefined()
    }
    expect(new Set([node, renderer].map((c) => c.compilerOptions.tsBuildInfoFile)).size).toBe(2)
  })

  it('defaults to plain renderer TypeScript and is unchanged on repeated generation', async () => {
    const directory = temporaryDirectory()
    await generate({ cwd: directory, preset: 'electron-vite' })
    expect(readConfig(directory, 'tsconfig.renderer.json').compilerOptions.jsx).toBeUndefined()
    const result = await generate({ cwd: directory, preset: 'electron-vite', framework: 'none' })
    expect(result.written).toEqual([])
    expect(result.unchanged.toSorted()).toEqual(filenames.toSorted())
  })

  it('plans the whole recipe without writing files', async () => {
    const directory = temporaryDirectory()
    const plans = await planGenerate({
      cwd: directory,
      preset: 'electron-vite',
      framework: 'react',
    })
    expect(plans.map((p) => p.filename)).toEqual(filenames)
    expect(plans.every((p) => p.kind === 'new')).toBe(true)
    expect(readdirSync(directory)).toEqual([])
  })

  // Auto-merging compilerOptions while preserving old include/references breaks process isolation.
  for (const filename of filenames) {
    it(`refuses all writes when ${filename} already needs changes`, async () => {
      const directory = temporaryDirectory()
      const existing = '{"compilerOptions":{"strict":false},"include":["legacy/**/*"]}\n'
      writeFileSync(join(directory, filename), existing)
      await rejects(
        generate({ cwd: directory, preset: 'electron-vite' }),
        (error: unknown) => error instanceof Error && error.message.includes(filename),
      )
      expect(readFileSync(join(directory, filename), 'utf8')).toBe(existing)
      expect(readdirSync(directory)).toEqual([filename])
    })
  }

  it('refuses to overwrite an existing malformed configuration', async () => {
    const directory = temporaryDirectory()
    const existing = '{ compilerOptions: '
    writeFileSync(join(directory, 'tsconfig.node.json'), existing)
    await rejects(generate({ cwd: directory, preset: 'electron-vite' }), /tsconfig\.node\.json/)
    expect(readFileSync(join(directory, 'tsconfig.node.json'), 'utf8')).toBe(existing)
    expect(readdirSync(directory)).toEqual(['tsconfig.node.json'])
  })

  it('refuses to overwrite a dangling configuration symlink', async () => {
    const directory = temporaryDirectory()
    symlinkSync('future-target.json', join(directory, 'tsconfig.node.json'))
    await rejects(generate({ cwd: directory, preset: 'electron-vite' }), /tsconfig\.node\.json/)
    expect(readdirSync(directory)).toEqual(['tsconfig.node.json'])
  })

  it('rejects a framework unsupported by the recipe API', async () => {
    const directory = temporaryDirectory()
    await rejects(
      generate({ cwd: directory, preset: 'electron-vite', framework: 'nextjs' } as never),
      /framework/,
    )
    expect(readdirSync(directory)).toEqual([])
  })

  it('rejects legacy options passed with a preset through the JavaScript API', async () => {
    const directory = temporaryDirectory()
    await rejects(
      generate({
        cwd: directory,
        preset: 'electron-vite',
        runtimes: ['node'],
        module: 'bundler',
      } as never),
      /cannot be combined/,
    )
    expect(readdirSync(directory)).toEqual([])
  })

  it('rejects an unknown preset through the JavaScript API', async () => {
    const directory = temporaryDirectory()
    await rejects(
      generate({ cwd: directory, preset: 'electron-webpack' } as never),
      /Unknown preset/,
    )
    expect(readdirSync(directory)).toEqual([])
  })
})

describe('electron-vite CLI', () => {
  it('runs the preset without legacy runtime/module flags', async () => {
    const directory = temporaryDirectory()
    const result = await runCli(directory, ['--preset', 'electron-vite', '--framework', 'react'])
    expect(result.exitCode).toBe(0)
    expect(readdirSync(directory).toSorted()).toEqual(filenames.toSorted())
    expect(readConfig(directory, 'tsconfig.renderer.json').compilerOptions.jsx).toBe('react-jsx')
  })

  for (const [flag, value] of [
    ['--runtime', 'node'],
    ['--module', 'bundler'],
    ['--view', 'test:vitest/globals:**/*.test.ts'],
    ['--lib', ''],
    ['--no-lib', ''],
    ['--testing', 'vitest'],
    ['--erasable', ''],
    ['--references', '../shared'],
    ['--paths', '@/*=./src/*'],
  ]) {
    it(`rejects conflicting ${flag} without writing files`, async () => {
      const directory = temporaryDirectory()
      const result = await runCli(directory, [
        '--preset',
        'electron-vite',
        flag!,
        ...(value ? [value] : []),
      ])
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('cannot be combined')
      expect(readdirSync(directory)).toEqual([])
    })
  }

  it('rejects unknown presets clearly', async () => {
    const directory = temporaryDirectory()
    const result = await runCli(directory, ['--preset', 'electron-webpack'])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Unknown preset')
    expect(readdirSync(directory)).toEqual([])
  })

  for (const flag of ['--typo', '--typo=value', '-x', '-x=value']) {
    it(`rejects unknown option ${flag} without writing files`, async () => {
      const directory = temporaryDirectory()
      const result = await runCli(directory, ['--preset', 'electron-vite', flag])
      expect(readdirSync(directory)).toEqual([])
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Unknown option')
      expect(result.stderr).toContain(flag.split('=')[0]!)
    })
  }

  for (const framework of ['nextjs', 'nestjs', 'vue', '']) {
    it(`rejects unsupported framework ${JSON.stringify(framework)}`, async () => {
      const directory = temporaryDirectory()
      const result = await runCli(directory, [
        '--preset',
        'electron-vite',
        `--framework=${framework}`,
      ])
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('framework')
      expect(readdirSync(directory)).toEqual([])
    })
  }
})

describe('electron-vite independent TypeScript environments', () => {
  // Minimal declaration fixtures make global visibility controlled; TypeScript itself is real.
  // Removing type isolation would let the intentionally invalid renderer source compile.
  it('shares Node and DOM types across main/preload while keeping renderer Node-free', async () => {
    const directory = temporaryDirectory()
    writeFixture(
      directory,
      'node_modules/@types/node/index.d.ts',
      'declare var process: { pid: number }\n',
    )
    writeFixture(
      directory,
      'node_modules/electron-vite/node.d.ts',
      'interface ImportMeta { readonly mainAsset: string }\n',
    )
    writeFixture(
      directory,
      'node_modules/vite/client.d.ts',
      'interface ImportMeta { readonly env: { VITE_TOKEN: string } }\n',
    )
    writeFixture(
      directory,
      'src/shared/bridge.d.ts',
      'export interface BridgeApi { ping(): Promise<string> }\n',
    )
    writeFixture(
      directory,
      'src/main/index.ts',
      'export const pid = process.pid\nexport const asset = import.meta.mainAsset\nexport const title = document.title\n',
    )
    writeFixture(
      directory,
      'src/preload/index.ts',
      [
        "import type { BridgeApi } from '../shared/bridge'",
        "export const bridge: BridgeApi = { ping: async () => 'pong' }",
        "export const element = document.createElement('div')",
        'export const pid = process.pid',
      ].join('\n'),
    )
    writeFixture(
      directory,
      'src/renderer/index.ts',
      [
        "import type { BridgeApi } from '../shared/bridge'",
        'declare global { interface Window { bridge: BridgeApi } }',
        "export const element = document.createElement('div')",
        'export const token = import.meta.env.VITE_TOKEN',
        'export const reply = window.bridge.ping()',
      ].join('\n'),
    )
    await generate({ cwd: directory, preset: 'electron-vite' })
    for (const filename of ['tsconfig.node.json', 'tsconfig.renderer.json']) {
      expect(
        diagnostics(directory, filename).map((d) =>
          ts.flattenDiagnosticMessageText(d.messageText, '\n'),
        ),
      ).toEqual([])
    }

    writeFixture(directory, 'src/renderer/forbidden.ts', 'export const pid = process.pid\n')
    expect(
      diagnostics(directory, 'tsconfig.renderer.json').some((d) =>
        ts.flattenDiagnosticMessageText(d.messageText, '\n').includes("Cannot find name 'process'"),
      ),
    ).toBe(true)
    expect(diagnostics(directory, 'tsconfig.node.json')).toEqual([])
  })
})

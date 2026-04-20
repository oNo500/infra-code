#!/usr/bin/env node
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'

import { generate, parsePathsArg } from './init'
import { splitNames } from './utils'

import type { Framework, GenOptions, ModuleMode, Runtime, ViewInput } from './init'

function parseViewSpec(spec: string): ViewInput {
  const [name = '', typesStr = '', includeStr = ''] = spec.split(':')
  return {
    name: name.trim(),
    types: typesStr ? splitNames(typesStr) : undefined,
    include: includeStr ? splitNames(includeStr) : undefined,
  }
}

function orExit<T>(v: T | symbol): T {
  if (p.isCancel(v)) { p.cancel('Cancelled'); process.exit(0) }
  return v as T
}

function buildEquivalentCommand(opts: GenOptions): string {
  const parts = ['tsconfig gen']
  parts.push(`--runtime ${opts.runtimes.join(',')}`)
  parts.push(`--module ${opts.module}`)
  if (opts.framework && opts.framework !== 'none') parts.push(`--framework ${opts.framework}`)
  if (opts.lib) parts.push('--lib')
  if (opts.views) {
    for (const v of opts.views) {
      const types = v.types?.join(',') ?? ''
      const include = v.include?.join(',') ?? ''
      parts.push(`--view ${v.name}:${types}:${include}`)
    }
  }
  if (opts.references) parts.push(`--references ${opts.references.join(',')}`)
  if (opts.paths) {
    const aliases = Object.entries(opts.paths).map(([k, v]) => `${k}=${v[0]}`).join(',')
    parts.push(`--paths ${aliases}`)
  }
  return parts.join(' ')
}

const gen = defineCommand({
  meta: {
    name: 'gen',
    description: 'Generate tsconfig.json files interactively or from flags.',
  },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    runtime: { type: 'string', description: 'Comma-separated runtimes: node,bun,browser,edge' },
    module: { type: 'string', description: 'Module mode: bundler or nodenext' },
    framework: { type: 'string', description: 'Framework: none, react, nextjs, nestjs' },
    lib: { type: 'boolean', description: 'Enable library mode (declaration output)' },
    view: { type: 'string', description: 'View spec: name:types:include (repeat flag for multiple views)', multiple: true },
    references: { type: 'string', description: 'Cross-package references: ../shared,../ui' },
    paths: { type: 'string', description: 'Path aliases: @/*=./src/*' },
  },
  async run({ args }) {
    const cwd = args.cwd
    const isTty = process.stdout.isTTY ?? false
    const hasArgs = Boolean(args.runtime || args.module || args.framework)
    const interactive = isTty && !hasArgs

    let opts: GenOptions

    if (interactive) {
      p.intro('tsconfig generator')

      const framework = orExit(await p.select<Framework>({
        message: 'Framework?',
        options: [
          { value: 'none', label: 'None', hint: 'plain TypeScript' },
          { value: 'react', label: 'React', hint: 'Vite, CRA, etc.' },
          { value: 'nextjs', label: 'Next.js', hint: 'App Router, RSC' },
          { value: 'nestjs', label: 'NestJS', hint: 'decorators + DI' },
        ],
      }))

      const defaultRuntimes: Runtime[] =
        framework === 'nextjs' ? ['node', 'browser'] :
        framework === 'nestjs' ? ['node'] :
        framework === 'react' ? ['browser'] :
        ['node']

      const runtimes = orExit(await p.multiselect<Runtime>({
        message: 'Runtime(s)?',
        options: [
          { value: 'node', label: 'Node.js' },
          { value: 'bun', label: 'Bun' },
          { value: 'browser', label: 'Browser' },
          { value: 'edge', label: 'Edge (Cloudflare Workers, etc.)' },
        ],
        initialValues: defaultRuntimes,
        required: true,
      }))

      const defaultModule: ModuleMode =
        framework === 'nestjs' ? 'nodenext' : 'bundler'

      const moduleMode = orExit(await p.select<ModuleMode>({
        message: 'Module system?',
        options: [
          { value: 'bundler', label: 'Bundler', hint: 'Vite, Next.js, tsdown — no emit' },
          { value: 'nodenext', label: 'NodeNext', hint: 'tsc emit, strict ESM/CJS' },
        ],
        initialValue: defaultModule,
      }))

      const libMode = orExit(await p.confirm({
        message: 'Library mode? (enables declaration + isolatedDeclarations)',
        initialValue: false,
      }))

      const addViews = orExit(await p.confirm({
        message: 'Add extra tsconfig views? (e.g. test, build)',
        initialValue: false,
      }))

      const views: ViewInput[] = []
      if (addViews) {
        const viewInput = orExit(await p.text({
          message: 'View specs (space-separated, format: name:types:include)',
          placeholder: 'test:vitest/globals:**/*.test.ts',
        }))
        if (viewInput.trim()) {
          for (const spec of viewInput.trim().split(' ').filter(Boolean)) {
            views.push(parseViewSpec(spec))
          }
        }
      }

      const pathsInput = orExit(await p.text({
        message: 'Path aliases (leave empty to skip)',
        placeholder: '@/*=./src/*',
        defaultValue: '',
      }))
      const paths = pathsInput.trim() ? parsePathsArg(pathsInput.trim()) : undefined

      opts = {
        cwd,
        framework: framework === 'none' ? undefined : framework,
        runtimes,
        module: moduleMode,
        lib: libMode,
        views: views.length > 0 ? views : undefined,
        paths,
      }
    } else {
      // flag mode
      if (!args.runtime) {
        console.error('--runtime is required in non-interactive mode (e.g. --runtime node)')
        process.exit(1)
      }
      if (!args.module) {
        console.error('--module is required in non-interactive mode (e.g. --module bundler)')
        process.exit(1)
      }

      const runtimes = splitNames(args.runtime) as Runtime[]
      const moduleMode = args.module as ModuleMode
      const viewArgs = args.view ? (Array.isArray(args.view) ? args.view : [args.view]) : []
      const views: ViewInput[] = viewArgs.map(parseViewSpec)
      const references = args.references ? splitNames(args.references) : undefined
      const paths = args.paths ? parsePathsArg(args.paths) : undefined

      opts = {
        cwd,
        framework: args.framework && args.framework !== 'none' ? (args.framework as Framework) : undefined,
        runtimes,
        module: moduleMode,
        lib: args.lib,
        views: views.length > 0 ? views : undefined,
        references,
        paths,
      }
    }

    const spinner = interactive ? p.spinner() : null
    spinner?.start('Generating tsconfig files')

    try {
      const result = await generate(opts)
      spinner?.stop('Done')
      if (interactive) {
        p.log.info(`Equivalent command:\n  ${buildEquivalentCommand(opts)}`)
        p.outro(`Generated ${result.written.length} file(s): ${result.written.join(', ')}`)
      } else {
        for (const f of result.written) console.log(`write  ${f}`)
      }
    } catch (err) {
      spinner?.stop('Failed')
      const message = err instanceof Error ? err.message : String(err)
      if (interactive) p.log.error(message)
      else console.error(message)
      process.exit(1)
    }
  },
})

const main = defineCommand({
  meta: { name: 'tsconfig', version: '0.0.0', description: 'tsconfig.json generator' },
  subCommands: { gen },
})

void runMain(main)

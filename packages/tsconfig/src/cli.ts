#!/usr/bin/env node
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'

import { generate, parsePathsArg } from './init'

import type { Framework, GenOptions, ModuleMode, Runtime, ViewInput } from './init'

function splitNames(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

/**
 * Parse a view spec string: "name:types:include"
 * types and include are optional, comma-separated within each segment.
 * Example: "test:vitest/globals:**\/*.test.ts"
 */
function parseViewSpec(spec: string): ViewInput {
  const [name = '', typesStr = '', includeStr = ''] = spec.split(':')
  return {
    name: name.trim(),
    types: typesStr ? typesStr.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    include: includeStr ? includeStr.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
  }
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
    view: { type: 'string', description: 'View spec: name:types:include (use space to repeat)' },
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

      const framework = await p.select<Framework>({
        message: 'Framework?',
        options: [
          { value: 'none', label: 'None', hint: 'plain TypeScript' },
          { value: 'react', label: 'React', hint: 'Vite, CRA, etc.' },
          { value: 'nextjs', label: 'Next.js', hint: 'App Router, RSC' },
          { value: 'nestjs', label: 'NestJS', hint: 'decorators + DI' },
        ],
      })
      if (p.isCancel(framework)) { p.cancel('Cancelled'); process.exit(0) }

      const defaultRuntimes: Runtime[] =
        framework === 'nextjs' ? ['node', 'browser'] :
        framework === 'nestjs' ? ['node'] :
        framework === 'react' ? ['browser'] :
        ['node']

      const runtimes = await p.multiselect<Runtime>({
        message: 'Runtime(s)?',
        options: [
          { value: 'node', label: 'Node.js' },
          { value: 'bun', label: 'Bun' },
          { value: 'browser', label: 'Browser' },
          { value: 'edge', label: 'Edge (Cloudflare Workers, etc.)' },
        ],
        initialValues: defaultRuntimes,
        required: true,
      })
      if (p.isCancel(runtimes)) { p.cancel('Cancelled'); process.exit(0) }

      const defaultModule: ModuleMode =
        framework === 'nestjs' ? 'nodenext' : 'bundler'

      const moduleMode = await p.select<ModuleMode>({
        message: 'Module system?',
        options: [
          { value: 'bundler', label: 'Bundler', hint: 'Vite, Next.js, tsdown — no emit' },
          { value: 'nodenext', label: 'NodeNext', hint: 'tsc emit, strict ESM/CJS' },
        ],
        initialValue: defaultModule,
      })
      if (p.isCancel(moduleMode)) { p.cancel('Cancelled'); process.exit(0) }

      const libMode = await p.confirm({
        message: 'Library mode? (enables declaration + isolatedDeclarations)',
        initialValue: false,
      })
      if (p.isCancel(libMode)) { p.cancel('Cancelled'); process.exit(0) }

      const addViews = await p.confirm({
        message: 'Add extra tsconfig views? (e.g. test, build)',
        initialValue: false,
      })
      if (p.isCancel(addViews)) { p.cancel('Cancelled'); process.exit(0) }

      const views: ViewInput[] = []
      if (addViews) {
        const viewInput = await p.text({
          message: 'View specs (space-separated, format: name:types:include)',
          placeholder: 'test:vitest/globals:**/*.test.ts',
        })
        if (p.isCancel(viewInput)) { p.cancel('Cancelled'); process.exit(0) }
        if (viewInput.trim()) {
          for (const spec of viewInput.trim().split(' ').map((s) => s.trim()).filter(Boolean)) {
            views.push(parseViewSpec(spec))
          }
        }
      }

      const pathsInput = await p.text({
        message: 'Path aliases (leave empty to skip)',
        placeholder: '@/*=./src/*',
        defaultValue: '',
      })
      if (p.isCancel(pathsInput)) { p.cancel('Cancelled'); process.exit(0) }
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
      const views: ViewInput[] = args.view
        ? splitNames(args.view).map(parseViewSpec)
        : []
      const references = args.references ? splitNames(args.references) : undefined
      const paths = args.paths ? parsePathsArg(args.paths) : undefined

      opts = {
        cwd,
        framework: (args.framework as Framework) || undefined,
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

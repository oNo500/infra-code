#!/usr/bin/env node
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'

import { applyWrites, generate, parsePathsArg, planGenerate } from './generate'
import { splitNames } from './utils'
import { defaultSelected, mergeWithChanges } from './write'

import type { Framework, GenOptions, ModuleMode, Runtime, Testing, ViewSpec } from './generate'
import type { FieldChange } from './write'

function parseViewSpec(spec: string): ViewSpec {
  const [name = '', typesStr = '', includeStr = ''] = spec.split(':')
  return {
    name: name.trim(),
    types: typesStr ? splitNames(typesStr) : undefined,
    include: includeStr ? splitNames(includeStr) : undefined,
  }
}

function orExit<T>(v: T | symbol): T {
  if (p.isCancel(v)) {
    p.cancel('Cancelled')
    process.exit(0)
  }
  return v
}

const formatValue = (v: unknown) => JSON.stringify(v)

function formatChange(c: FieldChange): string {
  if (c.kind === 'added') return `+ ${c.key}: ${formatValue(c.newValue)}`
  if (c.kind === 'removed') return `- ${c.key}: ${formatValue(c.oldValue)}`
  return `~ ${c.key}: ${formatValue(c.oldValue)} → ${formatValue(c.newValue)}`
}

function buildEquivalentCommand(opts: GenOptions): string {
  const parts = ['tsconfig']
  parts.push(`--runtime ${opts.runtimes.join(',')}`)
  parts.push(`--module ${opts.module}`)
  if (opts.framework && opts.framework !== 'none') parts.push(`--framework ${opts.framework}`)
  if (opts.testing) parts.push(`--testing ${opts.testing}`)
  if (opts.erasable) parts.push('--erasable')
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
    const aliases = Object.entries(opts.paths)
      .map(([k, v]) => `${k}=${v[0]}`)
      .join(',')
    parts.push(`--paths ${aliases}`)
  }
  return parts.join(' ')
}

const main = defineCommand({
  meta: {
    name: 'tsconfig',
    version: '0.0.0',
    description: 'Generate tsconfig.json files interactively or from flags.',
  },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    runtime: { type: 'string', description: 'Comma-separated runtimes: node,bun,browser,edge' },
    module: { type: 'string', description: 'Module mode: bundler or nodenext' },
    framework: { type: 'string', description: 'Framework: none, react, nextjs, nestjs' },
    testing: { type: 'string', description: 'Testing: vitest' },
    lib: { type: 'boolean', description: 'Enable library mode (declaration output)' },
    erasable: { type: 'boolean', description: 'Enforce erasable syntax only (ban enum/namespace)' },
    view: {
      type: 'string',
      description: 'View spec: name:types:include (repeat flag for multiple views)',
      multiple: true,
    },
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

      const framework = orExit(
        await p.select<Framework>({
          message: 'Framework?',
          options: [
            { value: 'none', label: 'None', hint: 'plain TypeScript' },
            { value: 'react', label: 'React', hint: 'Vite, CRA, etc.' },
            { value: 'nextjs', label: 'Next.js', hint: 'App Router, RSC' },
            { value: 'nestjs', label: 'NestJS', hint: 'decorators + DI' },
          ],
        }),
      )

      const defaultRuntimes: Runtime[] =
        framework === 'nextjs'
          ? ['node', 'browser']
          : framework === 'nestjs'
            ? ['node']
            : framework === 'react'
              ? ['browser']
              : ['node']

      const runtimes = orExit(
        await p.multiselect<Runtime>({
          message: 'Runtime(s)?',
          options: [
            { value: 'node', label: 'Node.js' },
            { value: 'bun', label: 'Bun' },
            { value: 'browser', label: 'Browser' },
            { value: 'edge', label: 'Edge (Cloudflare Workers, etc.)' },
          ],
          initialValues: defaultRuntimes,
          required: true,
        }),
      )

      const defaultModule: ModuleMode = framework === 'nestjs' ? 'nodenext' : 'bundler'

      const moduleMode = orExit(
        await p.select<ModuleMode>({
          message: 'Module system?',
          options: [
            { value: 'bundler', label: 'Bundler', hint: 'Vite, Next.js, tsdown — no emit' },
            { value: 'nodenext', label: 'NodeNext', hint: 'tsc emit, strict ESM/CJS' },
          ],
          initialValue: defaultModule,
        }),
      )

      type Extra = 'lib' | 'erasable' | Testing
      const extras = orExit(
        await p.multiselect<Extra>({
          message: 'Extras?',
          options: [
            { value: 'lib', label: 'Library mode', hint: 'declaration + isolatedDeclarations' },
            { value: 'vitest', label: 'Vitest', hint: 'vitest/globals types' },
            {
              value: 'erasable',
              label: 'Erasable syntax only',
              hint: 'ban enum/namespace, Node 22+ strip-friendly',
            },
          ],
          required: false,
        }),
      )

      const addViews = orExit(
        await p.confirm({
          message: 'Add extra tsconfig views? (e.g. test, build)',
          initialValue: false,
        }),
      )

      const views: ViewSpec[] = []
      if (addViews) {
        const viewInput = orExit(
          await p.text({
            message: 'View specs (space-separated, format: name:types:include)',
            placeholder: 'test:vitest/globals:**/*.test.ts',
          }),
        )
        if (viewInput.trim()) {
          for (const spec of viewInput.trim().split(' ').filter(Boolean)) {
            views.push(parseViewSpec(spec))
          }
        }
      }

      const pathsInput = orExit(
        await p.text({
          message: 'Path aliases (leave empty to skip)',
          placeholder: '@/*=./src/*',
          defaultValue: '',
        }),
      )
      const paths = pathsInput.trim() ? parsePathsArg(pathsInput.trim()) : undefined

      opts = {
        cwd,
        framework: framework === 'none' ? undefined : framework,
        runtimes,
        module: moduleMode,
        lib: extras.includes('lib'),
        testing: extras.includes('vitest') ? 'vitest' : undefined,
        erasable: extras.includes('erasable'),
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
      const views: ViewSpec[] = viewArgs.map(parseViewSpec)
      const references = args.references ? splitNames(args.references) : undefined
      const paths = args.paths ? parsePathsArg(args.paths) : undefined

      opts = {
        cwd,
        framework:
          args.framework && args.framework !== 'none' ? (args.framework as Framework) : undefined,
        testing: args.testing ? (args.testing as Testing) : undefined,
        erasable: args.erasable,
        runtimes,
        module: moduleMode,
        lib: args.lib,
        views: views.length > 0 ? views : undefined,
        references,
        paths,
      }
    }

    try {
      if (interactive) {
        const plans = await planGenerate(opts)
        const skip = new Set<string>()

        const merges = new Map<string, string>()

        for (const plan of plans) {
          if (plan.kind === 'unchanged') {
            p.log.info(`unchanged  ${plan.filename}`)
            continue
          }
          if (plan.kind === 'new') {
            p.log.info(`new  ${plan.filename}`)
            continue
          }

          const options = plan.changes.map((c) => ({
            value: c.key,
            label: formatChange(c),
            hint: c.key,
          }))
          const preSelected = defaultSelected(plan.changes)

          const selected = orExit(
            await p.multiselect<string>({
              message: `${plan.filename} — select changes to apply:`,
              options,
              initialValues: preSelected,
              required: false,
            }),
          )

          if (selected.length === 0) {
            skip.add(plan.filename)
          } else {
            merges.set(plan.filename, mergeWithChanges(plan, new Set(selected)))
          }
        }

        const result = await applyWrites(plans, skip, merges)
        p.log.info(`Equivalent command:\n  ${buildEquivalentCommand(opts)}`)
        const summary = [
          result.written.length > 0 ? `written: ${result.written.join(', ')}` : '',
          result.skipped.length > 0 ? `skipped: ${result.skipped.join(', ')}` : '',
          result.unchanged.length > 0 ? `unchanged: ${result.unchanged.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' · ')
        p.outro(summary || 'Nothing to do')
      } else {
        const result = await generate(opts)
        for (const f of result.written) console.log(`write  ${f}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (interactive) p.log.error(message)
      else console.error(message)
      process.exit(1)
    }
  },
})

void runMain(main)

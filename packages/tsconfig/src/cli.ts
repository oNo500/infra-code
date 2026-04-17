#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'

import { defineTsconfig } from './define'
import { explainTsconfig, renderExplain } from './explain'
import { isRenderedConfig, loadTsconfigConfig } from './loader'
import { checkAgainstDisk, syncToDisk } from './sync'
import type { DefineTsconfigInput, RenderedConfig } from './types'

async function loadRendered(cwd: string): Promise<RenderedConfig> {
  const loaded = await loadTsconfigConfig(cwd)
  return isRenderedConfig(loaded) ? loaded : defineTsconfig(loaded)
}

async function loadInput(cwd: string): Promise<DefineTsconfigInput> {
  const loaded = await loadTsconfigConfig(cwd)
  if (isRenderedConfig(loaded)) {
    throw new Error(
      'tsconfig.config.ts exported a rendered config, not a DefineTsconfigInput. ' +
        'Cannot explain without source DSL.',
    )
  }
  return loaded
}

const gen = defineCommand({
  meta: { name: 'gen', description: 'Generate tsconfig files from tsconfig.config.ts' },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
  },
  async run({ args }) {
    const cwd = args.cwd
    const rendered = await loadRendered(cwd)
    const result = await syncToDisk(rendered, cwd)
    for (const f of result.written) console.log(`write  ${f}`)
    for (const f of result.unchanged) console.log(`ok     ${f}`)
  },
})

const sync = defineCommand({
  meta: { name: 'sync', description: 'Sync tsconfig files (alias of gen)' },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    check: { type: 'boolean', description: 'Fail if disk differs from DSL output', default: false },
  },
  async run({ args }) {
    const cwd = args.cwd
    const rendered = await loadRendered(cwd)

    if (args.check) {
      const result = await checkAgainstDisk(rendered, cwd)
      if (result.ok) {
        console.log('tsconfig files are in sync with DSL')
        return
      }
      console.error('tsconfig files are out of sync with DSL:')
      for (const m of result.mismatches) {
        console.error(`  ${m.reason === 'missing' ? 'missing' : 'changed'}  ${m.filename}`)
      }
      console.error('\nRun `tsconfig sync` to regenerate.')
      process.exit(1)
    }

    const result = await syncToDisk(rendered, cwd)
    for (const f of result.written) console.log(`write  ${f}`)
    for (const f of result.unchanged) console.log(`ok     ${f}`)
  },
})

const explain = defineCommand({
  meta: { name: 'explain', description: 'Show the source of each compilerOptions field' },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    layer: { type: 'positional', description: 'Layer name (e.g. app, test)', required: false },
    field: { type: 'string', description: 'Show only this compilerOptions field' },
    format: { type: 'string', description: 'Output format: text | json', default: 'text' },
    hypothetical: {
      type: 'boolean',
      description: 'Show what each field would be if a source were removed',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = args.cwd
    const input = await loadInput(cwd)
    const explained = explainTsconfig(input)
    const format = args.format === 'json' ? 'json' : 'text'
    const output = renderExplain(explained, {
      layer: args.layer,
      field: args.field,
      format,
      hypothetical: args.hypothetical,
    })
    console.log(output)
  },
})

const main = defineCommand({
  meta: { name: 'tsconfig', version: '0.0.0', description: 'DSL-based tsconfig generator' },
  subCommands: { gen, sync, explain },
})

void runMain(main)

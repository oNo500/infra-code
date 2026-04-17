#!/usr/bin/env node
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'

import { defineTsconfig } from './define'
import { explainTsconfig, renderExplain } from './explain'
import { parsePathsArg, runInit } from './init'
import { configExists, isRenderedConfig, loadTsconfigConfig } from './loader'
import { PROFILES } from './profiles/registry'
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

function hasScaffoldArgs(args: { profile?: string; layers?: string; paths?: string }): boolean {
  return Boolean(args.profile || args.layers || args.paths)
}

const gen = defineCommand({
  meta: {
    name: 'gen',
    description:
      'Generate tsconfig files. Reads tsconfig.config.ts if present; otherwise scaffolds one from flags or interactive prompts.',
  },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    profile: { type: 'string', description: 'Profile name (e.g. nextjs) — scaffold mode' },
    layers: {
      type: 'string',
      description: 'Comma-separated layer names (e.g. app,test) — scaffold mode',
    },
    paths: {
      type: 'string',
      description: 'Paths aliases: "@/*=./src/*,@ui/*=../ui/src/*" — scaffold mode',
    },
    force: {
      type: 'boolean',
      description: 'Overwrite existing tsconfig.config.ts when scaffolding',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = args.cwd
    const exists = await configExists(cwd)
    const hasArgs = hasScaffoldArgs(args)
    const isTty = Boolean(process.stdout.isTTY)

    // Guard: user passed scaffold args but config already exists — refuse silent override.
    if (exists && hasArgs && !args.force) {
      console.error(
        'tsconfig.config.ts already exists. Refusing to overwrite — edit it directly, or pass --force.',
      )
      process.exit(1)
    }

    // Case 1: config exists (and no conflicting scaffold args) → regenerate from it.
    if (exists && !hasArgs) {
      const rendered = await loadRendered(cwd)
      const result = await syncToDisk(rendered, cwd)
      for (const f of result.written) console.log(`write  ${f}`)
      for (const f of result.unchanged) console.log(`ok     ${f}`)
      return
    }

    // Case 2: scaffold. Either no config exists, or --force was passed.
    await scaffold({ cwd, args, isTty, force: args.force || (exists && hasArgs) })
  },
})

interface ScaffoldOpts {
  cwd: string
  args: { profile?: string; layers?: string; paths?: string }
  isTty: boolean
  force: boolean
}

async function scaffold({ cwd, args, isTty, force }: ScaffoldOpts): Promise<void> {
  let profileName = args.profile
  let layerNames: string[]
  let paths: Record<string, readonly string[]> | undefined

  if (args.paths) paths = parsePathsArg(args.paths)

  const hasAnyArg = Boolean(args.profile || args.layers || args.paths)
  const interactive = isTty && !hasAnyArg

  if (interactive) {
    p.intro('tsconfig')

    const selected = await p.select({
      message: 'Which profile?',
      options: PROFILES.map((d) => ({
        value: d.name,
        label: d.label,
        hint: d.description,
      })),
    })
    if (p.isCancel(selected)) {
      p.cancel('Cancelled')
      process.exit(0)
    }
    profileName = selected as string

    const layerChoice = await p.select({
      message: 'Do you need multiple tsconfig files (app / test / build)?',
      options: [
        { value: 'none', label: 'No — single tsconfig.json' },
        { value: 'app-test', label: 'Yes — app + test' },
        { value: 'custom', label: 'Custom layers' },
      ],
    })
    if (p.isCancel(layerChoice)) {
      p.cancel('Cancelled')
      process.exit(0)
    }
    if (layerChoice === 'none') {
      layerNames = []
    } else if (layerChoice === 'app-test') {
      layerNames = ['app', 'test']
    } else {
      const input = await p.text({
        message: 'Layer names (comma-separated)',
        placeholder: 'app,test',
        defaultValue: 'app,test',
      })
      if (p.isCancel(input)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      layerNames = (input as string).split(',').map((s) => s.trim()).filter(Boolean)
    }

    const pathsInput = await p.text({
      message: 'Paths aliases (leave empty to skip)',
      placeholder: '@/*=./src/*',
      defaultValue: '',
    })
    if (p.isCancel(pathsInput)) {
      p.cancel('Cancelled')
      process.exit(0)
    }
    const raw = (pathsInput as string).trim()
    if (raw) paths = parsePathsArg(raw)
  } else {
    // Non-interactive path.
    if (!profileName) {
      console.error(
        'No tsconfig.config.ts found and --profile not provided.\n' +
          '  Run in a TTY for interactive prompts, or pass --profile <name>.\n' +
          `  Available profiles: ${PROFILES.map((pr) => pr.name).join(', ')}`,
      )
      process.exit(1)
    }
    layerNames = args.layers
      ? args.layers.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  }

  const spinner = interactive ? p.spinner() : null
  spinner?.start('Generating tsconfig files')

  try {
    const result = await runInit({
      cwd,
      profile: profileName!,
      layers: layerNames,
      paths,
      force,
    })
    spinner?.stop('Done')
    if (interactive) {
      p.outro(
        `Created ${result.configFile} and ${result.generatedFiles.length} tsconfig file(s)`,
      )
    } else {
      console.log(`write  ${result.configFile}`)
      for (const f of result.generatedFiles) console.log(`write  ${f}`)
    }
  } catch (err) {
    spinner?.stop('Failed')
    const message = err instanceof Error ? err.message : String(err)
    if (interactive) p.log.error(message)
    else console.error(message)
    process.exit(1)
  }
}

const sync = defineCommand({
  meta: {
    name: 'sync',
    description: 'Check or regenerate tsconfig files against tsconfig.config.ts',
  },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    check: {
      type: 'boolean',
      description: 'CI mode: fail if disk differs from DSL output',
      default: false,
    },
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
      console.error('\nRun `tsconfig gen` to regenerate.')
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

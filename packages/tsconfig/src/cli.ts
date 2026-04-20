#!/usr/bin/env node
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'

import { defineTsconfig } from './define'
import { explainTsconfig, renderExplain } from './explain'
import { parsePathsArg, runInit } from './init'
import { LAYER_PRESETS } from './layer-presets'
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

function splitNames(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
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
    once: {
      type: 'boolean',
      description: 'One-shot: generate tsconfig.*.json only, skip tsconfig.config.ts',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = args.cwd
    const exists = await configExists(cwd)
    const hasArgs = hasScaffoldArgs(args)
    const isTty = process.stdout.isTTY ?? false

    if (args.once) {
      await scaffold({ cwd, args, isTty, force: false, once: true })
      return
    }

    if (exists && hasArgs && !args.force) {
      console.error(
        'tsconfig.config.ts already exists. Refusing to overwrite — edit it directly, or pass --force. Use --once to generate JSON only without touching the DSL.',
      )
      process.exit(1)
    }

    if (exists && !hasArgs) {
      const rendered = await loadRendered(cwd)
      const result = await syncToDisk(rendered, cwd)
      for (const f of result.written) console.log(`write  ${f}`)
      for (const f of result.unchanged) console.log(`ok     ${f}`)
      return
    }

    await scaffold({ cwd, args, isTty, force: args.force || (exists && hasArgs), once: false })
  },
})

interface ScaffoldOpts {
  cwd: string
  args: { profile?: string; layers?: string; paths?: string }
  isTty: boolean
  force: boolean
  once: boolean
}

async function scaffold(opts: ScaffoldOpts): Promise<void> {
  const { cwd, args, isTty, force } = opts
  let once = opts.once
  let skipJson = false
  let profileName = args.profile
  let layerNames: string[]
  let paths: Record<string, readonly string[]> | undefined

  if (args.paths) paths = parsePathsArg(args.paths)

  const interactive = isTty && !hasScaffoldArgs(args)

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
    profileName = selected

    const chosen = await p.multiselect({
      message:
        'Which tsconfig layers do you need? (space to toggle, enter to confirm; leave empty for single tsconfig.json)',
      options: [
        ...Object.entries(LAYER_PRESETS).map(([value, preset]) => ({
          value,
          label: preset.label,
          hint: preset.hint,
        })),
        { value: 'custom', label: 'custom…', hint: 'enter your own names' },
      ],
      required: false,
    })
    if (p.isCancel(chosen)) {
      p.cancel('Cancelled')
      process.exit(0)
    }
    const chosenList = chosen
    if (chosenList.includes('custom')) {
      const input = await p.text({
        message: 'Layer names (comma-separated)',
        placeholder: 'app,test',
        defaultValue: chosenList.filter((x) => x !== 'custom').join(',') || 'app,test',
      })
      if (p.isCancel(input)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      layerNames = splitNames(input)
    } else {
      layerNames = chosenList
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
    const raw = pathsInput.trim()
    if (raw) paths = parsePathsArg(raw)

    if (!once) {
      const mode = await p.select({
        message: 'Maintenance mode?',
        options: [
          {
            value: 'managed',
            label: 'Managed',
            hint: 'Write tsconfig.config.ts (DSL). Re-run later to upgrade.',
          },
          {
            value: 'once',
            label: 'One-shot',
            hint: 'Only tsconfig.*.json. Edit them manually afterwards.',
          },
        ],
        initialValue: 'managed',
      })
      if (p.isCancel(mode)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      if (mode === 'once') once = true
    }

    if (!once) {
      const emitNow = await p.confirm({
        message: 'Also generate tsconfig.*.json now?',
        initialValue: true,
      })
      if (p.isCancel(emitNow)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      if (!emitNow) skipJson = true
    }
  } else {
    if (!profileName) {
      console.error(
        'No tsconfig.config.ts found and --profile not provided.\n' +
          '  Run in a TTY for interactive prompts, or pass --profile <name>.\n' +
          `  Available profiles: ${PROFILES.map((pr) => pr.name).join(', ')}`,
      )
      process.exit(1)
    }
    layerNames = args.layers ? splitNames(args.layers) : []
  }

  const spinner = interactive ? p.spinner() : null
  spinner?.start('Generating tsconfig files')

  try {
    const result = await runInit({
      cwd,
      profile: profileName,
      layers: layerNames,
      paths,
      force,
      once,
      skipJson,
    })
    spinner?.stop('Done')
    if (interactive) {
      let msg: string
      if (skipJson && result.configFile) {
        msg = `Created ${result.configFile}. Run \`tsconfig gen\` when ready to emit JSON.`
      } else if (!result.configFile) {
        msg = `Created ${result.generatedFiles.length} tsconfig file(s) (one-shot, no DSL)`
      } else {
        msg = `Created ${result.configFile} and ${result.generatedFiles.length} tsconfig file(s)`
      }
      p.outro(msg)
    } else {
      if (result.configFile) console.log(`write  ${result.configFile}`)
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

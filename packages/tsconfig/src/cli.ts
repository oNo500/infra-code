#!/usr/bin/env node
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'

import { generate, parsePathsArg } from './init'
import { LAYER_PRESETS } from './layer-presets'
import { PROFILES } from './profiles/registry'

function splitNames(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

const gen = defineCommand({
  meta: {
    name: 'gen',
    description: 'Generate tsconfig.*.json files interactively or from flags.',
  },
  args: {
    cwd: { type: 'string', description: 'Working directory', default: '.' },
    profile: { type: 'string', description: 'Profile name (e.g. nextjs)' },
    layers: { type: 'string', description: 'Comma-separated layer names (e.g. app,test)' },
    paths: { type: 'string', description: 'Path aliases: "@/*=./src/*,@ui/*=../ui/src/*"' },
  },
  async run({ args }) {
    const cwd = args.cwd
    const isTty = process.stdout.isTTY ?? false
    const hasArgs = Boolean(args.profile || args.layers || args.paths)
    const interactive = isTty && !hasArgs

    let profileName = args.profile
    let layerNames: string[] = args.layers ? splitNames(args.layers) : []
    let paths: Record<string, readonly string[]> | undefined
    if (args.paths) paths = parsePathsArg(args.paths)

    if (interactive) {
      p.intro('tsconfig')

      const selected = await p.select({
        message: 'Which profile?',
        options: PROFILES.map((d) => ({ value: d.name, label: d.label, hint: d.description })),
      })
      if (p.isCancel(selected)) { p.cancel('Cancelled'); process.exit(0) }
      profileName = selected

      const chosen = await p.multiselect({
        message: 'Which layers? (leave empty for a single tsconfig.json)',
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
      if (p.isCancel(chosen)) { p.cancel('Cancelled'); process.exit(0) }

      if (chosen.includes('custom')) {
        const input = await p.text({
          message: 'Layer names (comma-separated)',
          placeholder: 'app,test',
          defaultValue: chosen.filter((x) => x !== 'custom').join(',') || 'app,test',
        })
        if (p.isCancel(input)) { p.cancel('Cancelled'); process.exit(0) }
        layerNames = splitNames(input)
      } else {
        layerNames = chosen
      }

      const pathsInput = await p.text({
        message: 'Path aliases (leave empty to skip)',
        placeholder: '@/*=./src/*',
        defaultValue: '',
      })
      if (p.isCancel(pathsInput)) { p.cancel('Cancelled'); process.exit(0) }
      const raw = pathsInput.trim()
      if (raw) paths = parsePathsArg(raw)
    } else if (!profileName) {
      console.error(
        '--profile is required in non-interactive mode.\n' +
          `  Available profiles: ${PROFILES.map((p) => p.name).join(', ')}`,
      )
      process.exit(1)
    }

    const spinner = interactive ? p.spinner() : null
    spinner?.start('Generating tsconfig files')

    try {
      const result = await generate({ cwd, profile: profileName!, layers: layerNames, paths })
      spinner?.stop('Done')
      if (interactive) {
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

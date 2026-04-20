import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

import { defineCommand } from 'citty'
import { execa } from 'execa'
import { resolve } from 'pathe'
import {
  encodePreset,
  decodePreset,
  PRESET_STYLES,
  PRESET_THEMES,
  PRESET_BASE_COLORS,
  PRESET_RADII,
  PRESET_FONTS,
  PRESET_FONT_HEADINGS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_COLORS,
  PRESET_MENU_ACCENTS,
  DEFAULT_PRESET_CONFIG,
  type PresetConfig,
} from 'shadcn/preset'

const ROOT = resolve(import.meta.dir, '../../../..')
const UI_DIR = resolve(ROOT, 'packages/ui')
const THEME_CSS = resolve(UI_DIR, 'src/styles/shadcn-theme.css')
const THEME_CONFIG = resolve(UI_DIR, '.theme-config.json')
const SHADCN_INIT_API = 'https://ui.shadcn.com/init'

const CONFIG_PATHS = [
  resolve(UI_DIR, 'components.json'),
  resolve(ROOT, 'apps/web/components.json'),
  resolve(ROOT, 'apps/api-web/components.json'),
]

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readJsonOrEmpty(path: string): Record<string, unknown> {
  try {
    return readJson(path)
  } catch {
    return {}
  }
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

async function pick<T extends string>(
  label: string,
  options: readonly T[],
  current: T,
): Promise<T> {
  const currentIdx = options.indexOf(current)
  console.log(`\n${label}:`)
  options.forEach((o, i) => {
    console.log(`  ${i + 1}) ${o}${i === currentIdx ? ' ◀' : ''}`)
  })
  process.stdout.write(`  Choose [1-${options.length}] (enter = keep): `)
  for await (const line of console) {
    if (!line.trim()) return current
    const idx = parseInt(line, 10) - 1
    if (idx >= 0 && idx < options.length) return options[idx] as T
    console.log('  Invalid, keeping current.')
    return current
  }
  return current
}

function currentConfig(): PresetConfig {
  const json = readJson(CONFIG_PATHS[0]!)
  const tailwind = json.tailwind as Record<string, string> | undefined
  const rawStyle = ((json.style as string) ?? '').replace('base-', '') as PresetConfig['style']
  const extra = readJsonOrEmpty(THEME_CONFIG)
  return {
    ...DEFAULT_PRESET_CONFIG,
    style: PRESET_STYLES.includes(rawStyle) ? rawStyle : DEFAULT_PRESET_CONFIG.style,
    theme: ((extra.theme as string) ?? DEFAULT_PRESET_CONFIG.theme) as PresetConfig['theme'],
    baseColor: (tailwind?.baseColor ??
      DEFAULT_PRESET_CONFIG.baseColor) as PresetConfig['baseColor'],
    chartColor: ((extra.chartColor as string) ??
      DEFAULT_PRESET_CONFIG.chartColor) as PresetConfig['chartColor'],
    iconLibrary: ((json.iconLibrary as string) ??
      DEFAULT_PRESET_CONFIG.iconLibrary) as PresetConfig['iconLibrary'],
    menuColor: ((json.menuColor as string) ??
      DEFAULT_PRESET_CONFIG.menuColor) as PresetConfig['menuColor'],
    menuAccent: ((json.menuAccent as string) ??
      DEFAULT_PRESET_CONFIG.menuAccent) as PresetConfig['menuAccent'],
  }
}

type CssVars = Record<string, string>

async function fetchCssVars(config: PresetConfig): Promise<{ light: CssVars; dark: CssVars }> {
  const params = new URLSearchParams({
    base: 'radix',
    style: config.style,
    theme: config.theme,
    baseColor: config.baseColor,
    chartColor: config.chartColor ?? config.theme,
    iconLibrary: config.iconLibrary,
    font: config.font,
    fontHeading: config.fontHeading ?? 'inherit',
    menuColor: config.menuColor,
    menuAccent: config.menuAccent,
    radius: config.radius ?? 'default',
  })

  const res = await fetch(`${SHADCN_INIT_API}?${params}`, {
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`shadcn /init API returned ${res.status}: ${body}`)
  }

  const data = (await res.json()) as { cssVars?: { light?: CssVars; dark?: CssVars } }
  const light = data.cssVars?.light
  const dark = data.cssVars?.dark

  if (!light || !dark) {
    throw new Error('shadcn /init API response missing cssVars.light or cssVars.dark')
  }

  return { light, dark }
}

function varsToBlock(selector: string, vars: CssVars, colorScheme?: string): string {
  const lines = [`${selector} {`]
  if (colorScheme) lines.push(`  color-scheme: ${colorScheme};`)
  for (const [key, val] of Object.entries(vars)) {
    lines.push(`  --${key}: ${val};`)
  }
  lines.push('}')
  return lines.join('\n')
}

function writeCssVars(light: CssVars, dark: CssVars): void {
  const src = readFileSync(THEME_CSS, 'utf8')
  const rootBlock = varsToBlock(':root', light, 'light')
  const darkBlock = varsToBlock('.dark', dark, 'dark')
  const stripped = src
    .replace(/:root\s*\{[^}]*\}/gs, '')
    .replace(/\.dark\s*\{[^}]*\}/gs, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()

  writeFileSync(THEME_CSS, `${stripped}\n\n${rootBlock}\n\n${darkBlock}\n`, 'utf8')
  console.log('Updated CSS vars in shadcn-theme.css')
}

function syncConfigs(config: PresetConfig): void {
  for (const path of CONFIG_PATHS) {
    const json = readJson(path)
    const tailwind = (json.tailwind ?? {}) as Record<string, unknown>
    json.style = `base-${config.style}`
    json.tailwind = { ...tailwind, baseColor: config.baseColor }
    json.iconLibrary = config.iconLibrary
    json.menuColor = config.menuColor
    json.menuAccent = config.menuAccent
    writeJson(path, json)
    console.log(`Updated ${path.replace(ROOT + '/', '')}`)
  }
  writeJson(THEME_CONFIG, {
    theme: config.theme,
    chartColor: config.chartColor ?? config.theme,
  })
}

export const theme = defineCommand({
  meta: {
    name: 'theme',
    description: 'Switch the shadcn theme for the monorepo',
  },
  args: {
    preset: {
      type: 'string',
      description: 'Preset code to apply directly (e.g. b0)',
    },
  },
  async run({ args }) {
    let config: PresetConfig

    if (args.preset) {
      const decoded = decodePreset(args.preset)
      if (!decoded) {
        console.error(`Invalid preset code: ${args.preset}`)
        process.exit(1)
      }
      config = decoded
      console.log(`Applying preset ${args.preset}:`, config)
    } else {
      const cur = currentConfig()
      console.log('\n── shadcn theme switcher ──────────────────────────────')
      config = {
        style: await pick('Style', PRESET_STYLES, cur.style),
        theme: await pick('Theme (accent color)', PRESET_THEMES, cur.theme),
        baseColor: await pick('Base color (neutral grays)', PRESET_BASE_COLORS, cur.baseColor),
        radius: await pick('Radius', PRESET_RADII, cur.radius),
        font: await pick('Font', PRESET_FONTS, cur.font),
        fontHeading: await pick('Font heading', PRESET_FONT_HEADINGS, cur.fontHeading),
        iconLibrary: await pick('Icon library', PRESET_ICON_LIBRARIES, cur.iconLibrary),
        menuColor: await pick('Menu color', PRESET_MENU_COLORS, cur.menuColor),
        menuAccent: await pick('Menu accent', PRESET_MENU_ACCENTS, cur.menuAccent),
        chartColor: await pick('Chart color', PRESET_THEMES, cur.chartColor ?? cur.theme),
      }
    }

    const presetCode = encodePreset(config)
    console.log(`\nPreset code: ${presetCode}`)

    syncConfigs(config)

    // Fetch CSS vars from shadcn /init API (includes theme accent color)
    console.log('\nFetching CSS vars …')
    const { light, dark } = await fetchCssVars(config)
    writeCssVars(light, dark)

    // Sync component files to match the selected style
    console.log('\nUpdating components …')
    const components = readdirSync(resolve(UI_DIR, 'src/components'))
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace('.tsx', ''))

    await execa('pnpm', ['dlx', 'shadcn@latest', 'add', '--yes', '--overwrite', ...components], {
      cwd: UI_DIR,
      stdio: 'inherit',
    })

    console.log(`\nDone. To reuse: pnpm theme --preset ${presetCode}`)
  },
})

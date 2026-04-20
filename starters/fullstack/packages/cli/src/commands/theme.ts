import { defineCommand } from "citty"
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
} from "shadcn/preset"
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { spawnSync } from "node:child_process"

const ROOT = resolve(import.meta.dir, "../../../..")
const UI_DIR = resolve(ROOT, "packages/ui")

const CONFIG_PATHS = [
  resolve(UI_DIR, "components.json"),
  resolve(ROOT, "apps/web/components.json"),
  resolve(ROOT, "apps/api-web/components.json"),
]

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8"))
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8")
}

async function pick<T extends string>(
  label: string,
  options: readonly T[],
  current: T,
): Promise<T> {
  const currentIdx = options.indexOf(current)
  console.log(`\n${label}:`)
  options.forEach((o, i) => {
    console.log(`  ${i + 1}) ${o}${i === currentIdx ? " ◀" : ""}`)
  })
  process.stdout.write(`  Choose [1-${options.length}] (enter = keep): `)
  for await (const line of console) {
    if (!line.trim()) return current
    const idx = parseInt(line, 10) - 1
    if (idx >= 0 && idx < options.length) return options[idx] as T
    console.log("  Invalid, keeping current.")
    return current
  }
  return current
}

function currentConfig(): PresetConfig {
  const json = readJson(CONFIG_PATHS[0]!)
  const tailwind = json.tailwind as Record<string, string> | undefined
  const rawStyle = ((json.style as string) ?? "").replace("base-", "") as PresetConfig["style"]
  return {
    ...DEFAULT_PRESET_CONFIG,
    style: PRESET_STYLES.includes(rawStyle) ? rawStyle : DEFAULT_PRESET_CONFIG.style,
    theme: (tailwind?.baseColor ?? DEFAULT_PRESET_CONFIG.theme) as PresetConfig["theme"],
    baseColor: (tailwind?.baseColor ?? DEFAULT_PRESET_CONFIG.baseColor) as PresetConfig["baseColor"],
    chartColor: (tailwind?.baseColor ?? DEFAULT_PRESET_CONFIG.chartColor) as PresetConfig["chartColor"],
    iconLibrary: ((json.iconLibrary as string) ?? DEFAULT_PRESET_CONFIG.iconLibrary) as PresetConfig["iconLibrary"],
    menuColor: ((json.menuColor as string) ?? DEFAULT_PRESET_CONFIG.menuColor) as PresetConfig["menuColor"],
    menuAccent: ((json.menuAccent as string) ?? DEFAULT_PRESET_CONFIG.menuAccent) as PresetConfig["menuAccent"],
  }
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
    console.log(`Updated ${path.replace(ROOT + "/", "")}`)
  }
}

export const theme = defineCommand({
  meta: {
    name: "theme",
    description: "Switch the shadcn theme for the monorepo",
  },
  args: {
    preset: {
      type: "string",
      description: "Preset code to apply directly (e.g. b0)",
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
      console.log("\n── shadcn theme switcher ──────────────────────────────")
      config = {
        style:       await pick("Style", PRESET_STYLES, cur.style),
        theme:       await pick("Theme (accent color)", PRESET_THEMES, cur.theme),
        baseColor:   await pick("Base color (neutral grays)", PRESET_BASE_COLORS, cur.baseColor),
        radius:      await pick("Radius", PRESET_RADII, cur.radius),
        font:        await pick("Font", PRESET_FONTS, cur.font),
        fontHeading: await pick("Font heading", PRESET_FONT_HEADINGS, cur.fontHeading),
        iconLibrary: await pick("Icon library", PRESET_ICON_LIBRARIES, cur.iconLibrary),
        menuColor:   await pick("Menu color", PRESET_MENU_COLORS, cur.menuColor),
        menuAccent:  await pick("Menu accent", PRESET_MENU_ACCENTS, cur.menuAccent),
        chartColor:  await pick("Chart color", PRESET_THEMES, cur.chartColor ?? cur.theme),
      }
    }

    const presetCode = encodePreset(config)
    console.log(`\nPreset code: ${presetCode}`)

    syncConfigs(config)

    console.log("\nReinstalling components with new theme …")
    const components = readdirSync(resolve(UI_DIR, "src/components"))
      .filter(f => f.endsWith(".tsx"))
      .map(f => f.replace(".tsx", ""))

    const result = spawnSync(
      "pnpm",
      ["dlx", "shadcn@latest", "add", "--yes", "--overwrite", ...components],
      { cwd: UI_DIR, stdio: "inherit" },
    )

    if (result.status !== 0) process.exit(result.status ?? 1)
    console.log(`\nDone. To reuse: pnpm theme --preset ${presetCode}`)
  },
})

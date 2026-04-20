import type { DefineTsconfigInput, LayerInput } from './types'

export function buildLayerChain(name: string, layers: Record<string, LayerInput>): string[] {
  return walk(name, layers, new Set())
}

function walk(name: string, layers: Record<string, LayerInput>, seen: Set<string>): string[] {
  if (seen.has(name)) {
    throw new Error(`Circular layer extends: ${[...seen, name].join(' → ')}`)
  }
  seen.add(name)
  const layer = layers[name]
  if (!layer) throw new Error(`Layer '${name}' not found`)
  if (!layer.extends) return [name]
  return [...walk(layer.extends, layers, seen), name]
}

export function pickInclude(
  input: DefineTsconfigInput,
  chain: string[],
  layers: Record<string, LayerInput>,
): readonly string[] | undefined {
  for (let i = chain.length - 1; i >= 0; i--) {
    const inc = layers[chain[i]!]?.include
    if (inc) return inc
  }
  return input.include ?? input.profile?.include
}

export function pickExclude(
  input: DefineTsconfigInput,
  chain: string[],
  layers: Record<string, LayerInput>,
): readonly string[] | undefined {
  for (let i = chain.length - 1; i >= 0; i--) {
    const exc = layers[chain[i]!]?.exclude
    if (exc) return exc
  }
  return input.exclude ?? input.profile?.exclude
}

/**
 * Resolve which layer becomes tsconfig.json. Explicit `primary` wins; else
 * prefer 'app' when present; else first declared layer. Throws on unknown name.
 */
export function resolvePrimary(primary: string | undefined, names: string[]): string {
  if (primary) {
    if (!names.includes(primary)) {
      throw new Error(`primary layer '${primary}' not defined in layers`)
    }
    return primary
  }
  if (names.includes('app')) return 'app'
  return names[0]!
}

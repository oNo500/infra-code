import type { DefineTsconfigInput, LayerInput } from './types'

/** Walk a layer's extends chain, detecting circular references. */
export function buildLayerChain(
  name: string,
  layers: Record<string, LayerInput>,
  seen: Set<string> = new Set(),
): string[] {
  if (seen.has(name)) {
    throw new Error(`Circular layer extends: ${[...seen, name].join(' → ')}`)
  }
  seen.add(name)
  const layer = layers[name]
  if (!layer) throw new Error(`Layer '${name}' not found`)
  if (!layer.extends) return [name]
  return [...buildLayerChain(layer.extends, layers, seen), name]
}

/** Walk the chain from tip back to root, returning the first defined include list. */
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

/** Walk the chain from tip back to root, returning the first defined exclude list. */
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

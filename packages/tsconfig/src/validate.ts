interface CommandLineOption {
  name: string
  type: 'boolean' | 'string' | 'number' | 'object' | 'list' | Map<string, unknown>
  element?: CommandLineOption
  deprecated?: boolean
}

interface ValidationWarning {
  key: string
  message: string
  suggestion?: string
}

interface TypescriptModule {
  optionDeclarations: CommandLineOption[]
}

function isTypescriptModule(v: unknown): v is TypescriptModule {
  return typeof v === 'object' && v !== null && 'optionDeclarations' in v && Array.isArray((v as TypescriptModule).optionDeclarations)
}

let declarations: CommandLineOption[] | null | undefined = undefined

function loadDeclarations(): CommandLineOption[] | null {
  if (declarations !== undefined) return declarations
  try {
    const ts: unknown = require('typescript')
    declarations = isTypescriptModule(ts) ? ts.optionDeclarations : null
  } catch {
    declarations = null
  }
  return declarations
}

function closestMatch(key: string, candidates: string[]): string | undefined {
  let best: string | undefined
  let bestDist = Infinity
  const a = key.toLowerCase()
  for (const c of candidates) {
    const b = c.toLowerCase()
    const dist = editDistance(a, b)
    if (dist < bestDist) {
      bestDist = dist
      best = c
    }
  }
  return bestDist <= 3 ? best : undefined
}

function editDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
    }
  }
  return dp[m]![n]!
}

export function validateCompilerOptions(
  opts: Record<string, unknown>,
): ValidationWarning[] {
  const decls = loadDeclarations()
  if (!decls) return []

  const knownKeys = new Set(decls.map((d) => d.name))
  const byName = new Map(decls.map((d) => [d.name, d]))
  const warnings: ValidationWarning[] = []

  for (const [key, value] of Object.entries(opts)) {
    if (!knownKeys.has(key)) {
      const suggestion = closestMatch(key, [...knownKeys])
      warnings.push({
        key,
        message: `Unknown compilerOption "${key}"`,
        suggestion,
      })
      continue
    }

    const decl = byName.get(key)!
    if (!(decl.type instanceof Map)) continue

    const allowed = decl.type

    if (Array.isArray(value)) {
      // list type — validate each element if element decl exists
      const elemType = decl.element?.type
      if (elemType instanceof Map) {
        for (const item of value as unknown[]) {
          if (typeof item === 'string' && !elemType.has(item.toLowerCase())) {
            const suggestion = closestMatch(item, [...elemType.keys()])
            warnings.push({
              key,
              message: `Invalid value "${item}" for compilerOption "${key}". Allowed: ${[...elemType.keys()].join(', ')}`,
              suggestion,
            })
          }
        }
      }
    } else if (typeof value === 'string' && !allowed.has(value.toLowerCase())) {
      const suggestion = closestMatch(value, [...allowed.keys()])
      warnings.push({
        key,
        message: `Invalid value "${value}" for compilerOption "${key}". Allowed: ${[...allowed.keys()].join(', ')}`,
        suggestion,
      })
    }
  }

  return warnings
}

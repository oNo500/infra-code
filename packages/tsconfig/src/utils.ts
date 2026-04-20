export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && v.constructor === Object
}

export function itemKey(item: unknown): string {
  return typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)
}

export function dedupe<T>(arr: readonly T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of arr) {
    const key = itemKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err
}

export function splitNames(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

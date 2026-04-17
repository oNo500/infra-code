import { beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { configExists } from '../src/loader'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'tsconfig-loader-'))
})

describe('configExists', () => {
  it('returns false for empty directory', async () => {
    expect(await configExists(tmp)).toBe(false)
  })

  it('detects tsconfig.config.ts', async () => {
    writeFileSync(join(tmp, 'tsconfig.config.ts'), 'export default {}')
    expect(await configExists(tmp)).toBe(true)
  })

  it('detects tsconfig.config.mjs', async () => {
    writeFileSync(join(tmp, 'tsconfig.config.mjs'), 'export default {}')
    expect(await configExists(tmp)).toBe(true)
  })

  it('detects tsconfig.config.js', async () => {
    writeFileSync(join(tmp, 'tsconfig.config.js'), 'module.exports = {}')
    expect(await configExists(tmp)).toBe(true)
  })
})

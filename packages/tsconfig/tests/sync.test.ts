import { beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { defineTsconfig } from '../src/define'
import { nextjs } from '../src/profiles/nextjs'
import { syncToDisk } from '../src/sync'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'tsconfig-sync-'))
})

describe('syncToDisk', () => {
  it('writes files initially and marks them unchanged on re-run', async () => {
    const config = defineTsconfig({ profile: nextjs() })
    const first = await syncToDisk(config, tmp)
    expect(first.written).toEqual(['tsconfig.json'])

    const second = await syncToDisk(config, tmp)
    expect(second.written).toEqual([])
    expect(second.unchanged).toEqual(['tsconfig.json'])
  })
})

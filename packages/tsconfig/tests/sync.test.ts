import { beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { defineTsconfig } from '../src/define'
import { base, buildBundler, composeAtoms, frameworkNextjs, runtimeBrowser, runtimeNode } from '../src/profiles/atoms'
import { syncToDisk } from '../src/sync'

const nextjsCompilerOptions = composeAtoms(base(), runtimeNode(), runtimeBrowser(), buildBundler(), frameworkNextjs())

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'tsconfig-sync-'))
})

describe('syncToDisk', () => {
  it('writes files initially and marks them unchanged on re-run', async () => {
    const config = defineTsconfig({ profile: { compilerOptions: nextjsCompilerOptions } })
    const first = await syncToDisk(config, tmp)
    expect(first.written).toEqual(['tsconfig.json'])

    const second = await syncToDisk(config, tmp)
    expect(second.written).toEqual([])
    expect(second.unchanged).toEqual(['tsconfig.json'])
  })
})

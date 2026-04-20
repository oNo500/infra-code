import { beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { base, buildBundler, composeAtoms, frameworkNextjs, runtimeBrowser, runtimeNode } from '../src/atoms'
import { renderConfig } from '../src/render'
import { writeFiles } from '../src/write'

const nextjsOptions = composeAtoms(base(), runtimeNode(), runtimeBrowser(), buildBundler(), frameworkNextjs())

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'tsconfig-write-'))
})

describe('writeFiles', () => {
  it('writes files initially and marks them unchanged on re-run', async () => {
    const config = renderConfig({ compilerOptions: nextjsOptions })
    const first = await writeFiles(config, tmp)
    expect(first.written).toEqual(['tsconfig.json'])

    const second = await writeFiles(config, tmp)
    expect(second.written).toEqual([])
    expect(second.unchanged).toEqual(['tsconfig.json'])
  })

  it('detects no change even when existing file has different field order', async () => {
    const config = renderConfig({ compilerOptions: nextjsOptions })
    await writeFiles(config, tmp)

    // Simulate a file with different field ordering (e.g. written by another tool)
    const { writeFileSync, readFileSync } = await import('node:fs')
    const filePath = join(tmp, 'tsconfig.json')
    const existing = JSON.parse(readFileSync(filePath, 'utf8').replace(/^\s*\/\/.*$/gm, '').trim()) as Record<string, unknown>
    const reordered = JSON.stringify({ ...existing }, null, 2) + '\n'
    writeFileSync(filePath, reordered)

    const second = await writeFiles(config, tmp)
    expect(second.unchanged).toEqual(['tsconfig.json'])
  })
})

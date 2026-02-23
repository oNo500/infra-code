import path from 'node:path'

import { composeConfig } from '@infra-x/eslint-config'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const fixturesDir = path.join(import.meta.dirname, 'fixtures')

async function lintFile(filePath: string, config = composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
})) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
  })
  const results = await eslint.lintFiles([filePath])
  return results[0]!
}

function getRuleIds(result: Awaited<ReturnType<typeof lintFile>>) {
  return result.messages.map((m) => m.ruleId)
}

describe('composeConfig - fixture lint', () => {
  it('valid/basic.ts 应无 error', async () => {
    const result = await lintFile(path.join(fixturesDir, 'valid/basic.ts'))
    expect(result.errorCount).toBe(0)
  })

  it('valid/unicorn-node-protocol.ts 应无 error', async () => {
    const result = await lintFile(path.join(fixturesDir, 'valid/unicorn-node-protocol.ts'))
    expect(result.errorCount).toBe(0)
  })

  it('invalid/consistent-type-import.ts 应报 @typescript-eslint/consistent-type-imports', async () => {
    const result = await lintFile(path.join(fixturesDir, 'invalid/consistent-type-import.ts'))
    expect(getRuleIds(result)).toContain('@typescript-eslint/consistent-type-imports')
  })

  it('invalid/unicorn-node-protocol.ts 应报 unicorn/prefer-node-protocol', async () => {
    const result = await lintFile(path.join(fixturesDir, 'invalid/unicorn-node-protocol.ts'))
    expect(getRuleIds(result)).toContain('unicorn/prefer-node-protocol')
  })

  it('invalid/stylistic-quotes.ts 应报 @stylistic/quotes', async () => {
    const result = await lintFile(path.join(fixturesDir, 'invalid/stylistic-quotes.ts'))
    expect(getRuleIds(result)).toContain('@stylistic/quotes')
  })

  it('invalid/imports-newline-after.ts 应报 import-x/newline-after-import（imports 模块开启时）', async () => {
    const result = await lintFile(path.join(fixturesDir, 'invalid/imports-newline-after.ts'), composeConfig({
      typescript: { tsconfigRootDir: import.meta.dirname },
      imports: true,
    }))
    expect(getRuleIds(result)).toContain('import-x/newline-after-import')
  })

  describe('选项控制', () => {
    it('unicorn: false 时 unicorn 规则不触发', async () => {
      const result = await lintFile(path.join(fixturesDir, 'invalid/unicorn-node-protocol.ts'), composeConfig({
        typescript: { tsconfigRootDir: import.meta.dirname },
        unicorn: false,
      }))
      expect(getRuleIds(result)).not.toContain('unicorn/prefer-node-protocol')
    })

    it('stylistic: false 时 @stylistic/quotes 不触发', async () => {
      const result = await lintFile(path.join(fixturesDir, 'invalid/stylistic-quotes.ts'), composeConfig({
        typescript: { tsconfigRootDir: import.meta.dirname },
        stylistic: false,
      }))
      expect(getRuleIds(result)).not.toContain('@stylistic/quotes')
    })
  })
})

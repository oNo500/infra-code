import path from 'node:path'

import { composeConfig } from '@infra-x/eslint-config'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const fixturesDir = path.join(import.meta.dirname, 'fixtures')

async function lintFile(filePath: string) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: composeConfig({
      typescript: { tsconfigRootDir: import.meta.dirname },
    }),
  })
  const results = await eslint.lintFiles([filePath])
  return results[0]!
}

describe('composeConfig - fixture lint', () => {
  it('valid/basic.ts 应无 error', async () => {
    const result = await lintFile(path.join(fixturesDir, 'valid/basic.ts'))
    expect(result.errorCount).toBe(0)
  })

  it('invalid/consistent-type-import.ts 应报 @typescript-eslint/consistent-type-imports error', async () => {
    const result = await lintFile(path.join(fixturesDir, 'invalid/consistent-type-import.ts'))
    const ruleIds = result.messages.map((m) => m.ruleId)
    expect(ruleIds).toContain('@typescript-eslint/consistent-type-imports')
  })
})

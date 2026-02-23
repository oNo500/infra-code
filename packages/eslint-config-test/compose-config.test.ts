import { ESLint } from 'eslint'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { composeConfig } from '@infra-x/eslint-config'

const fixturesDir = join(import.meta.dirname, 'fixtures')

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
    const result = await lintFile(join(fixturesDir, 'valid/basic.ts'))
    expect(result.errorCount).toBe(0)
  })

  it('invalid/consistent-type-import.ts 应报 @typescript-eslint/consistent-type-imports error', async () => {
    const result = await lintFile(join(fixturesDir, 'invalid/consistent-type-import.ts'))
    const ruleIds = result.messages.map((m) => m.ruleId)
    expect(ruleIds).toContain('@typescript-eslint/consistent-type-imports')
  })
})

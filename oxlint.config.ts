import { base, typeAware, unicorn, depend } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), typeAware(), unicorn(), depend()],
  ignorePatterns: ['starters/**'],
  rules: {
    // TypeScript's type checker already validates narrowed assertions; this rule
    // produces false positives on guarded casts (e.g. after typeof/Array.isArray checks).
    'typescript/no-unsafe-type-assertion': 'off',
  },
})

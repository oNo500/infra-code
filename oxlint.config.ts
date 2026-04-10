import { base, unicorn, depend } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend()],
  ignorePatterns: ['packages/eslint-config/**', 'packages/eslint-config-test/**'],
  options: {
    typeAware: true,
  },
})

import { base, typeAware, unicorn, depend } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), typeAware(), unicorn(), depend()],
  ignorePatterns: ['starters/**'],
})

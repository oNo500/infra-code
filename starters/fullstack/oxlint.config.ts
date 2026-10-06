import { base, unicorn, depend } from '@infra-x/oxlint-presets'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend()],
  rules: {
    'import/no-cycle': 'error',
  },
})

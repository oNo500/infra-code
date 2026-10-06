import { base, depend, react, unicorn } from '@infra-x/oxlint-presets'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend(), react()],
})

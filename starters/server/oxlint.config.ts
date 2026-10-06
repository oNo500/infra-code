import { base, depend, drizzle, node, promise, unicorn } from '@infra-x/oxlint-presets'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend(), node(), promise(), drizzle()],
})

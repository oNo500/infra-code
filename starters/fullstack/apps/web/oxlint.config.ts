import { react, nextjs, vitest } from '@infra-x/oxlint-presets'
import { defineConfig } from 'oxlint'

import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [rootConfig, react(), nextjs(), vitest()],
})

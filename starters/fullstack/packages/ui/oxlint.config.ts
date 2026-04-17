import { react } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [rootConfig, react()],
})

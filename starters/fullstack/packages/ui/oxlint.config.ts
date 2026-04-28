import { react } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [rootConfig, react()],
  // Skip files managed by `shadcn add` — they get regenerated on upgrade.
  // Custom components live in subdirectories (e.g. components/kibo-ui/)
  // and remain linted by the non-recursive `*.tsx` glob.
  ignorePatterns: ['src/components/*.tsx', 'src/hooks/**', 'src/lib/**'],
})

import { base, depend, node, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend(), node()],
  rules: {
    // execa wraps node:child_process with a Promise API and better stdio handling;
    // the shadcn-add wrapper here is shorter than a native equivalent.
    'depend/ban-dependencies': [
      'error',
      {
        presets: ['native', 'microutilities', 'preferred'],
        modules: [],
        allowed: ['dotenv', 'execa'],
      },
    ],
  },
})

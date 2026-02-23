import { composeConfig } from '@infra-x/eslint-config'

import type { Linter } from 'eslint'

const config: Linter.Config[] = [
  { ignores: ['fixtures/**'] },
  ...composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    imports: { typescript: true },
    vitest: true,
  }),
]
export default config

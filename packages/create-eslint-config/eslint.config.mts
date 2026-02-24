import { composeConfig } from '@infra-x/eslint-config'

import type { Linter } from 'eslint'

const config: Linter.Config[] = composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname, allowDefaultProject: ['*.config.ts', '*.config.mts'], defaultProject: 'tsconfig.node.json' },
  imports: { typescript: true },
})
export default config

import { composeConfig } from './src/index'

import type { Linter } from 'eslint'

const config: Linter.Config[] = composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname, allowDefaultProject: ['*.config.ts', '*.config.mts'], defaultProject: 'tsconfig.node.json' },
  imports: {
    typescript: true,
    overrides: {
      // 本包内部使用相对导入，因为没有配置路径别名
      'no-restricted-imports': 'off',
    },
  },
})
export default config

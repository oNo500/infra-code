# @workspace/eslint-config

统一基础设施配置工具 - 集成 ESLint、Prettier、TypeScript、EditorConfig

## 安装

```bash
pnpm add -D @workspace/eslint-config eslint prettier typescript
```

## 使用

```typescript
// eslint.config.mts
import { composeConfig } from '@workspace/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: { typescript: true },
  prettier: true,
})
```

## 配置项

### 默认开启

- `ignores` - 忽略文件配置
- `javascript` - JavaScript 基础规则
- `typescript` - TypeScript 规则
- `stylistic` - 代码风格规则
- `unicorn` - 最佳实践
- `depend` - 依赖优化建议

### 可选配置

- `react` - React 规则
- `nextjs` - Next.js 规则
- `imports` - Import 排序和规则
- `prettier` - Prettier 格式化
- `a11y` - 无障碍访问规则
- `jsdoc` - JSDoc 文档规则
- `boundaries` - 模块边界规则
- `packageJson` - package.json 规则
- `vitest` - Vitest 测试规则
- `storybook` - Storybook 规则

每个配置项支持：
- `true` - 使用默认配置
- `{ ...options }` - 自定义配置
- `false` - 禁用（仅限默认开启的配置）

## License

PROPRIETARY

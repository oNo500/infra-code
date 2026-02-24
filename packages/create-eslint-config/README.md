# @infra-x/create-eslint-config

CLI 工具，将完整的 ESLint 配置模板复制到 monorepo 的 `eslint-config/` 目录。

## 使用

```bash
pnpm dlx @infra-x/create-eslint-config
```

在 monorepo 根目录执行，会将 `eslint-config/` 目录（含规则定义和 `composeConfig` 工厂函数）
复制到当前工作目录。如果目标路径存在冲突文件，会提示确认是否覆盖。

完整集成说明见[根目录 README](../../README.md)。

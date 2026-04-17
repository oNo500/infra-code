# Style Guide

## 命名规范

| 类型 | 约定 | 示例 |
|---|---|---|
| 文件 / 目录 | kebab-case | `user-profile.tsx`, `auth-provider/` |
| 组件（代码中） | PascalCase | `UserProfile`, `AuthProvider` |
| 函数 / 变量 | camelCase | `getUserData`, `isAuthenticated` |
| 类型 / 接口 | PascalCase | `User`, `AuthConfig` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| `lib/` | — | 对第三方库的封装（axios 实例、dayjs 配置等） |
| `utils/` | — | 纯工具函数，与第三方库无关 |

## 代码风格

- **禁止双重类型断言**：`value as X as Y` 形式的断言被禁止。出现双重断言说明存在类型不匹配，应从设计层面修复，而非绕过类型系统。
- **禁止 emoji**：所有源文件中禁止使用 emoji，除非项目负责人针对特定用途明确要求。
- **环境变量**：所有配置必须通过环境变量注入，禁止硬编码配置值。环境变量必须集中在 `src/config/env.ts` 中验证和导出；禁止在其他文件直接访问 `process.env.*` 或 `import.meta.env.*`。

## 测试约定

- **测试优先**：遵循 TDD，测试必须先于实现编写（Red-Green-Refactor 循环）。
- **就近放置**：测试文件必须与被测源文件放在同一目录。跨模块端到端测试放在 `__tests__/e2e/`。

```
src/
  features/
    foo/
      bar.tsx
      bar.test.tsx        # 与源文件同目录
__tests__/
  e2e/                    # 跨模块完整用户流程
  setup.ts                # @testing-library/jest-dom
```

- 测试类型靠内容区分，不靠目录名或文件名后缀。

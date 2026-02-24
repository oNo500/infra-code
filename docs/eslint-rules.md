# ESLint 规则约定

本项目使用 `@infra-x/eslint-config` 统一管理 ESLint 规则。以下为各规则集的核心约定，供 AI 生成代码时参考。

## TypeScript

基于 `typescript-eslint` 推荐规则集（`recommendedTypeChecked` + `stylisticTypeChecked`）。

- 使用 `type` 导入类型：`import type { Foo } from './foo'`
- 禁止使用 `interface`，统一用 `type`（`consistent-type-definitions` 已关闭，但推荐 `type`）
- 不写可推断的类型注解（`no-inferrable-types`）
- 不声明未使用的变量和参数（由 `no-unused-vars` 接管，TypeScript 版本关闭）
- 避免使用已废弃的 API（`no-deprecated: warn`）
- `unbound-method` 仅警告不报错
- Promise 返回值须处理；`void` 回调可不处理（`checksVoidReturn.attributes: false`）

## JavaScript

基于 `@eslint/js` 推荐规则集，ES2026+ 全局变量，`sourceType: module`，支持 JSX。

## Imports（导入排序）

导入顺序（每组之间空一行）：

```
1. Node built-in（如 node:fs）
2. 外部包
3. 内部路径（@/** 别名）
4. 相对路径（父级 ../ 和同级 ./）
5. index
6. type（类型导入）
```

- 同组内按字母升序排列（不区分大小写）
- 导入块末尾空一行（`newline-after-import`）
- 类型导入统一放最后，单独一组
- 禁止循环依赖（`no-cycle`）
- 禁止未使用的导出（`no-unused-modules`）
- 禁止引入未在 `package.json` 声明的依赖（`no-extraneous-dependencies`）
- 使用一致的类型导入写法（`consistent-type-specifier-style`）

## Unicorn

基于 `eslint-plugin-unicorn` 推荐规则集。

- 允许使用 `null`（`no-null` 已关闭）
- 允许缩写变量名（`prevent-abbreviations` 已关闭）
- 其余 unicorn 推荐规则全部启用，包括：
  - 优先使用现代 JS API（`prefer-string-at`、`prefer-array-flat` 等）
  - 禁止嵌套三元表达式
  - 优先使用 `import.meta.url` 替代 `__dirname`
  - 文件名使用 kebab-case

## Stylistic（代码风格）

- 缩进：2 空格
- 不加分号
- 单引号
- 多行末尾逗号（`commaDangle: always-multiline`）
- 箭头函数参数始终加括号
- 大括号风格：`1tbs`
- 对象 key 仅在必要时加引号（`quoteProps: consistent-as-needed`）

## React

基于 `@eslint-react`（TypeScript 推荐）+ `react-hooks` + `react-refresh`。

- 遵循 Hooks 规则（依赖数组完整性等）
- 组件导出须支持热更新（`react-refresh`）
- 仅对 `*.{jsx,tsx}` 文件生效

## Tailwind CSS

- 使用 `eslint-plugin-better-tailwindcss`
- class 强制换行（`printWidth: 0`，每个 class 独占一行）
- 入口文件默认为 `src/global.css`
- 仅对 `*.{jsx,tsx}` 文件生效

## Vitest

- 统一使用 `it`（包括 `describe` 内部）
- 测试标题小写
- Hooks 按顺序书写（`prefer-hooks-in-order`）
- CI 环境下禁止 `skip` 和 `only`（编辑器中降级为警告）
- 测试文件中允许 `console`，关闭部分 TypeScript 严格规则

## Depend（依赖优化）

检测以下场景并报错：

- 可用原生 JS API 替代的包（如 `is-nan` → `Number.isNaN()`）
- 微型工具库（一行代码可实现的包）
- 有更好替代方案的包

## Boundaries（架构边界）

按需配置，需提供 `elements` 和 `rules`，默认拒绝所有跨边界访问。

## JSDoc

基于 `flat/contents-typescript` 规则集，关闭描述格式匹配和信息性文档检查。

## Package.json

- 启用 stylistic 规则（字段排序等）
- 关闭本地依赖路径校验（`valid-local-dependency: off`）

## A11y（无障碍）

基于 `eslint-plugin-jsx-a11y` 推荐规则集，仅对 `*.{jsx,tsx}` 生效。

## Ignores（默认忽略）

以下路径默认忽略：

- `node_modules/`、`.pnp.*`
- `dist/`、`build/`、`out/`、`.next/`
- `.cache/`、`.turbo/`、`.eslintcache`
- `.git/`、`.svn/`、`.hg/`、`public/`
- `**/*.d.ts`
- 项目根目录 `.gitignore` 中的所有条目（自动读取）

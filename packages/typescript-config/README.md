# @infra-x/typescript-config

共享 TypeScript 配置文件集合。

## 配置文件

```
packages/typescript-config/
├── tsconfig.base.json          # 基础（严格模式 + 质量检查）
├── tsconfig.library.json       # Node.js 库（NodeNext + declaration）
├── tsconfig.react-library.json # React 组件库（preserve + jsx + declaration）
├── tsconfig.vite.json          # Vite + React（preserve + jsx + noEmit）
├── tsconfig.nextjs.json        # Next.js（esnext + bundler + jsx + noEmit + next 插件）
├── tsconfig.nestjs.json        # NestJS（bundler + 装饰器）
└── tsconfig.vitest.json        # 测试（宽松检查 + vitest globals）
```

## 使用方式

在项目的 `tsconfig.json` 中继承：

```json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json"
}
```

## 配置说明

| 配置 | 适用场景 | 关键特性 |
|-----|---------|---------|
| `base` | 所有项目的基础 | strict, noUncheckedIndexedAccess, 质量检查 |
| `library` | bundler 工具库/npm 包 | preserve, bundler, isolatedDeclarations, noEmit |
| `react-library` | React 组件库 | preserve, bundler, jsx, declaration, isolatedDeclarations, DOM |
| `vite` | Vite + React 应用 | preserve, bundler, jsx, noEmit, DOM |
| `nextjs` | Next.js 应用 | esnext, bundler, jsx, noEmit, next 插件 |
| `nestjs` | NestJS 后端服务 | bundler, 装饰器支持 |
| `vitest` | Vitest 测试文件 | 宽松检查, vitest/globals |

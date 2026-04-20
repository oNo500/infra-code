# RFC 001: `@infra-x/tsconfig` — Design Decisions

- **Status**: Stable
- **Author**: xiu
- **Date**: 2026-04-17
- **Supersedes**: `@infra-x/typescript-config` (2.x)

## Problem

TypeScript 的 `extends` 是字段级替换，不是深合并。数组字段（`types`、`lib`、`plugins`）在继承链上会静默覆盖：

```
base config:  types: ['node']
test config:  types: ['vitest/globals']  ← 覆盖，node 丢失
```

用户必须在每个叶子 tsconfig 手动重新声明合并后的完整数组。这是结构性问题，无论怎么重组 atom，只要依赖 `extends`，数组合并就无解。

## Goals

- 消除数组字段的静默覆盖
- 用户声明意图，不声明继承顺序
- 生成的 tsconfig.json 直接可用，IDE / tsc / oxlint 开箱即用
- 支持多视图 tsconfig（app/test/build）

## Non-goals

- 不维护配置文件——生成后即完成，不留中间产物
- 不管理跨包拓扑（`references` 由用户声明）
- 不做运行时 config loader，输出是纯 JSON
- 不向后兼容 2.x

## What it is now

两种使用方式，平等定位：

**CLI 生成器**：交互式问答或 flag 模式，直接写出 tsconfig.json，无需维护配置文件。

```bash
tsconfig                                          # 交互式
tsconfig --runtime node --module bundler          # flag 模式
```

**Atom 组合库**：直接 import atoms，程序化组合，适合需要精确控制的场景。

```ts
import { composeAtoms, base, runtimeNode, buildBundler } from '@infra-x/tsconfig'

const options = composeAtoms(base(), runtimeNode(), buildBundler())
```

Atoms 是单一职责的 `CompilerOptions` 片段，`composeAtoms` 负责合并——scalar 后者覆盖前者，数组 append+dedupe。

## Why no config file

早期设计有 `tsconfig.config.ts` DSL 文件 + `sync` 命令的工作流。放弃原因：

- 增加了维护负担——用户需要同时维护 DSL 文件和生成的 JSON
- CLI 问答已能覆盖绝大多数场景，配置文件带来的灵活性收益有限
- 需要程序化控制的场景直接用 API，不需要文件作为中间层

## Why code generation over extends

只有代码生成能从根本上解决数组合并问题——工具自己控制合并逻辑，不依赖 tsc 的 `extends` 语义。

生成文件不 gitignore 的理由：VS Code、oxlint（`typeAware`）、vite-tsconfig-paths、vitest、Next.js 等工具都假设 `tsconfig.json` 在项目打开时就在磁盘上。gitignore 会破坏冷启动体验（postinstall 完成前红色报错）。

## Alternatives rejected

**A. 修补 2.x**
继续用 atom + extends 模型，增加更多 profile。
拒绝原因：根本问题是 tsc extends 语义，atom 重组无法解决数组合并。

**B. 链式函数 DSL**
```ts
tsconfig('node').pipe(withTypes.append(['vitest/globals']))
```
拒绝原因：tsconfig 是静态对象，无条件组合需求。链式 API 需要大量 helper 且无收益。

**C. gitignore 生成文件 + postinstall 再生成**
拒绝原因：破坏 IDE 冷启动体验，oxlint `typeAware` 首次运行依赖 tsconfig.json 在磁盘上存在。

**D. 等待 TypeScript 官方支持数组合并**
相关 issue（#20110、#57486）已开多年，Microsoft 未接受。不可等待。

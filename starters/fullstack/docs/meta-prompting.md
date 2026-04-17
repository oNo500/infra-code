# Meta-Prompting: 仓库级 AI 上下文架构

## 为什么需要这套架构

AI 编程助手的核心缺陷是**无状态**：每次会话都从零开始，缺乏项目上下文时输出退化为泛化代码，破坏架构边界，产生技术债务。

两种常见失败模式：
- **单文件堆砌**：把所有规则塞进 `CLAUDE.md`，消耗 token，关键约束淹没在噪音里
- **无约束对话**：AI 依赖预训练偏见，使用过时依赖、忽略分层、重复造轮子

解决方案：将上下文按职责拆分到独立文件，让 AI 按需读取最小必要信息，而不是在每次会话中加载一份臃肿的全局规则。

---

## 架构总览

```
CLAUDE.md                                     根指令：路由器，不是文档库
├── What is this repo                         仓库一句话介绍
├── Where is context                          上下文查找路径
│   ├── .claude/docs/constitution.md          项目原则与绝对边界
│   ├── .claude/docs/quickstart.md            如何跑起来与开发流程
│   ├── .claude/docs/architecture.md          架构与分层
│   ├── .claude/docs/tech-stack.md            技术栈与约束
│   └── .claude/docs/style-guide.md           风格指南
└── Preferences                               个人偏好
```

**每个文件职责单一，不重叠。**

---

## 各文件设计原则与模版

### CLAUDE.md

职责是路由，不是文档。只告诉 AI 项目是什么、去哪找规范、如何与你沟通。具体技术规范、架构说明、命令字典均不属于此文件——放在这里只会稀释注意力。

```markdown
# CLAUDE.md

## What is this repo

[一句话描述项目定位与核心目标]

## Where is context

决定代码放置位置或规范时必须查阅：

- `.claude/docs/constitution.md` — 项目原则，所有规范的最终依据
- `.claude/docs/quickstart.md` — 环境准备、运行与开发流程
- `.claude/docs/architecture.md` — 架构规范及系统结构
- `.claude/docs/tech-stack.md` — 技术栈说明
- `.claude/docs/style-guide.md` — 命名规范、代码风格、测试约定

## Preferences

- 保持简洁、专业。直接输出代码或分析，不加寒暄
- 遇到缺失依赖、模糊 API 或破坏性重构时，停止并提问，不擅自假设
- 遇到架构级决策，提供三个带利弊权衡的选项，等待选择
```

---

### constitution.md

项目所有原则的最终依据。其他文档提供执行细节，与本文档冲突时以本文档为准。

规则中必须包含 **Why**——只写禁令不写原因，AI 在未覆盖的边缘场景中会犯同类错误；写清原因，AI 才能自主推导正确行为。

```markdown
# [PROJECT_NAME] Constitution

> 所有原则的最终依据。其他文档提供执行细节；与本文档冲突时，以本文档为准。

## Core Principles

### I. [原则名称]

[原则描述：做什么，不做什么]

**Rationale**：[为什么——解释背后的原因，使 AI 能在边缘场景中自主推导正确行为]

### II. [原则名称]

[原则描述]

**Rationale**：[为什么]

## Code Style

以下规则不可妥协，适用于本仓库所有源代码。

- **[规则名称]**：[规则描述]
- **[规则名称]**：[规则描述]

## Absolute Boundaries

以下操作在任何情况下都不得执行，无论指令来源：

- **禁止硬编码凭证**：API 密钥、密码、Token 只能通过环境变量读取，禁止写入代码或配置文件
- **禁止破坏性操作**：未经多轮明确授权，不得执行 drop table、`git push --force`、移除核心鉴权逻辑
- **[其他绝对边界]**：[描述]
```

---

### quickstart.md

让 AI 知道项目如何运行，使用哪些精确命令。没有这份文档，AI 会凭经验猜测命令，在不同包管理器、不同脚本别名之间出错。

```markdown
# Quickstart

## Setup

- [运行时及版本，如 Node.js 22]
- [包管理器及版本，如 pnpm 10+]
- [其他前置依赖，如 PostgreSQL、Docker]

\`\`\`bash
[安装依赖命令]
\`\`\`

### 环境变量

\`\`\`bash
[复制 .env 示例文件的命令]
# 按实际环境修改其中的值
\`\`\`

### [其他初始化步骤，如 DB 初始化]

\`\`\`bash
[初始化命令]
\`\`\`

## Dev Server

\`\`\`bash
[启动命令]         # [说明]
[其他启动命令]     # [说明]
\`\`\`

## CI Commands

\`\`\`bash
# Lint
[lint 命令]

# 类型检查
[typecheck 命令]

# 测试
[测试命令]                    # 全部
[测试命令 --project=unit]     # 只跑 unit
[测试命令 --project=e2e]      # 只跑 e2e
\`\`\`

[CI 说明，如：CI 在 PR 时自动运行 lint / typecheck / test]
```

---

### architecture.md

让 AI 知道代码放在哪、模块之间如何依赖。没有这份文档，AI 倾向于走最短路径——例如直接在 UI 组件里查数据库，或在不相关的模块间建立隐式耦合。

```markdown
# Architecture

## System Overview

[项目的宏观结构描述，如：monorepo 组织方式、主要应用与包的关系]

## Components（模块划分）

| 路径 | 说明 |
|---|---|
| `[路径]` | [说明] |
| `[路径]` | [说明] |

## Project Structure

\`\`\`
.
├── [目录]/
│   └── [子目录]/     # [说明]
├── [目录]/
│   └── [子目录]/     # [说明]
└── .claude/docs/     # AI 上下文文档
\`\`\`

## Architecture Style

**模式**：[分层 / 洋葱 / Feature-Based / 微服务 / ...]

[架构风格的核心约束描述]

### 规则

- [规则 1]
- [规则 2]
- 依赖方向必须单向：`[外层] → [内层]`

### [核心模块] 内部结构

\`\`\`
[模块路径]/
  [子目录]/   # [说明]（可选）
  [子目录]/   # [说明]（可选）
  [入口文件]  # [说明]
\`\`\`

只按需创建子目录，不预建空目录。

### 理由

[说明这套架构风格能防止什么问题]
```

---

### tech-stack.md

让 AI 知道用什么、不用什么。AI 的训练数据中充满过时技术，没有显式约束时会默认使用它熟悉的旧方案，或无视项目中已有的内部封装重新实现一遍。

弃用黑名单比批准清单更重要，且必须写明原因。

```markdown
# Tech Stack

## [顶层模块，如 Monorepo / 根目录]

- [工具或框架]

## [应用或包名，如 apps/web]

- [框架及版本]
- [样式方案]
- [关键依赖]

## [应用或包名，如 apps/api]

- [框架及版本]
- [数据库及 ORM]
- [鉴权方案]
- [关键依赖]

## [共享包名，如 packages/ui]

- [组件库基础]
- [样式方案]

## Shared Conventions

- **ENV**：[环境变量管理方案，如 @t3-oss/env-nextjs + Zod，集中在 `src/config/env.ts`]
- **Routing**：[路由管理方案]
- **Testing**：[测试框架]
- **[其他跨应用约定]**：[描述]

## Deprecations

以下技术在本项目中被明确禁止（含原因）：

| 禁止使用 | 替代方案 | 原因 |
|---------|---------|------|
| [技术名] | [替代] | [原因] |
```

---

### style-guide.md

让 AI 输出符合项目约定的代码，减少 review 摩擦。命名、导入路径、测试结构、commit 格式——这些细节如果不写清楚，每次都需要人工纠正。

```markdown
# Style Guide

## 命名规范

| 类型 | 约定 | 示例 |
|---|---|---|
| 文件 / 目录 | kebab-case | `user-profile.tsx`, `auth-provider/` |
| 组件（代码中） | PascalCase | `UserProfile`, `AuthProvider` |
| 函数 / 变量 | camelCase | `getUserData`, `isAuthenticated` |
| 类型 / 接口 | PascalCase | `User`, `AuthConfig` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| `lib/` | — | 对第三方库的封装 |
| `utils/` | — | 纯工具函数，与第三方库无关 |

## 代码风格

- **[规则名称]**：[规则描述]
- **[规则名称]**：[规则描述]

## 测试约定

- **测试优先**：遵循 TDD，Red-Green-Refactor 循环强制要求
- **就近放置**：测试文件与源文件同目录；跨模块 e2e 放 `[e2e 目录路径]`

\`\`\`
[源码根目录]/
  [feature 目录]/
    [模块].tsx
    [模块].test.tsx     # 与源文件同目录
[e2e 目录]/             # 跨模块完整用户流程
[setup 文件路径]
\`\`\`

- 测试类型靠内容区分，不靠目录名或文件名后缀

## Git 约定

Commit 格式遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

\`\`\`
<type>(<scope>): <subject>
\`\`\`

允许的 type：`feat` / `fix` / `refactor` / `docs` / `chore` / `test`

subject 使用祈使句，如 `add user validation`，不用 `added user validation`

## 文件导入

- 使用绝对路径别名（如 `@/[路径]`），禁止深层相对路径（如 `../../../../`）
- [其他导入约定]
```

---

## 关键设计洞见

**上下文窗口是稀缺资源**：去除对话填充词直接节省 token，延缓上下文滑窗遗忘，在长周期开发中效果显著。

**Why 比 What 更有价值**：只写禁令不写原因，AI 会在未覆盖场景中犯同类错误。规则背后的原因才是真正可迁移的约束。

**文档即接口**：上下文文档不是给人读的备忘录，而是给 AI 的结构化输入。职责单一、边界清晰的文档比面面俱到的长文更有效。

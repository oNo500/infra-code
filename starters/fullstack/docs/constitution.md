<!--
Constitution
==================
模版大纲
灵感来自于：spec-kit

## 核心原则

- **Library-First**：优先用成熟库，不重复造轮子
- **MVP-First**：功能最小化，只做必须的
- **Feature-Based Architecture**：按功能模块组织代码，而非按技术层
- **Test-Driven Development**：先写测试，迫使在编码前想清楚 API 设计与边界条件；TDD 是确保代码可信度的唯一方式
- **Functional Programming First**：优先使用纯函数、不可变数据

## 代码风格

- **测试就近原则**：测试文件与源文件放在同一目录
- **环境变量**：所有配置通过环境变量注入，不硬编码
- **TypeScript 类型**：禁止双重断言（`as X as Y`）；双重断言表明类型不匹配，说明设计本身存在问题
- **禁止 emoji**：源代码中不得使用 emoji，除非有明确要求
-->

# Base Project Constitution

## Core Principles

### I. Library-First

优先使用成熟、经过实战验证的库，而非自行实现。在编写新功能之前，先评估是否有现成的库能覆盖该场景。只有在没有合适的库、或引入库的代价明显不合理时，才允许编写自定义代码。

**Rationale**：重复解决已有答案的问题既浪费时间，又引入不必要的 bug。成熟的库自带社区测试、文档和维护，对项目而言边际成本为零。

### II. MVP-First

每个 feature 必须以最小可行范围实现。不得在需求之外扩展功能。在明确要求之前，禁止添加推测性或"锦上添花"的内容。

**Rationale**：过度设计会增加维护负担、拖慢交付。最小正确实现永远是首选。复杂度可以后续添加，但很难移除。

### III. Feature-Based Architecture

代码必须按 feature 模块组织，而非按技术层划分。import 方向严格单向：`app/ → features/ → components/, hooks/, lib/, config/`。Feature 之间禁止直接互相引用；共享需求必须提升到共享包或共享目录。

**Rationale**：按技术层组织（顶层的 models/、controllers/、services/）会在不相关的 feature 之间产生隐式耦合。Feature 模块强制封装，并支持独立交付。

### IV. Test-Driven Development（不可妥协）

测试必须在实现之前编写。Red-Green-Refactor 循环是强制要求：先写一个失败的测试，再实现最少的代码使其通过，然后重构。没有先写测试的实现代码一律不被接受。

**Rationale**：TDD 是唯一能强制在写代码之前完成 API 设计和边界情况推导的机制，也是代码正确性的唯一可靠信号。事后补测试是不够的——它测的是已经写出来的代码，而不是应该写出来的代码。

### V. Functional Programming First

纯函数和不可变数据结构必须作为默认选择。副作用必须显式声明、隔离在系统边界处，并尽量减少。除非不存在纯粹的替代方案，否则禁止共享可变状态。

**Rationale**：纯函数天然易于测试和组合，理解它们无需了解任何外部状态。不可变性消除了一整类由意外 mutation 引起的 bug。

## Code Style

以下规则不可妥协，适用于本仓库所有源代码。

- **Environment variables**：所有配置必须通过环境变量注入，禁止硬编码配置值。环境变量必须集中在 `src/config/env.ts` 中验证和导出；禁止在其他文件直接访问 `process.env.*` 或 `import.meta.env.*`。
- **No double type assertions**：禁止双重类型断言（`value as X as Y`）。出现双重断言说明存在类型不匹配，是设计缺陷的信号。修复设计，而不是绕过类型系统。
- **No emoji in source code**：禁止在所有源文件中使用 emoji，除非项目负责人针对特定用途明确要求。



# 工程项目文档模版

当前模版受`spec-kit`启发，旨在更好的组织 AI 上下文文档，指导 AI 辅助编程。

## 目录

1. Constitution            项目原则（AI需要遵守的第一宪法）
2. Architecture            架构和分层
3. Tech Stack              技术栈和约束
4. Quickstart              快速上手
5. Style Guide             风格指南（命名规范、代码风格、日志错误、测试约定）

### Template

### 1. Constitution  
```
待补充
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
```        

### Architecture 架构和分层

```
# [PROJECT_NAME] 架构

## System Overview
 ？ 这个章节和 架构风格冲突么，可以合并么，或者根目录是 仓库的组织介绍？app 中项目说明写架构风格？
## 架构风格

**模式**: [分层/洋葱/六边形/微服务/Feature-Based Architecture/...]

## Components 分层结构
待补充...

## Project Structure

## 规则

## 扩展指南
```

### Tech Stack 技术栈和约束

```
# [PROJECT_NAME] 技术栈

## 核心技术栈

?? 补充点啥好？需要分层么？

```

> 需要分 app 和根目录么

### Quickstart 快速上手

```
## Setup
### 环境变量
### 初始化
## Development Workflow or main command
## CI or Linter
```

###  Style Guide 风格指南

```
## 命名规范
## 代码风格
## 测试约定
## Git 约定
## 文件导入（包/别名？）
```
---
name: component-generator
description: 基于设计生成组件代码
---

# Component Generator Skill

基于设计稿或描述自动生成组件代码，支持 React/Vue/Svelte。

## 功能
- 从设计稿生成 JSX/Vue 模板
- 自动推断 Props 类型
- 提取样式为 CSS/SCSS
- 生成响应式代码
- 创建 TypeScript 接口

## 输入参数
```json
{
  "design_description": "string",
  "framework": "react|vue|svelte",
  "with_typescript": true,
  "style_approach": "css-modules|styled-components|tailwind"
}
```

## 返回值
```json
{
  "component_code": "string",
  "style_code": "string",
  "types": "string"
}
```

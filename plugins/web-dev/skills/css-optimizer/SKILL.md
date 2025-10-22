---
name: css-optimizer
description: CSS 优化和清理
---

# CSS Optimizer Skill

优化 CSS 代码，移除未使用样式，合并重复规则，压缩优化。

## 功能
- 移除未使用的 CSS
- 合并重复样式规则
- CSS 压缩和最小化
- 自动添加浏览器前缀
- 颜色值优化
- 选择器优化

## 输入参数
```json
{
  "css_code": "string",
  "used_selectors": ["array"],
  "options": {
    "remove_unused": true,
    "merge_duplicates": true,
    "minify": true
  }
}
```

## 返回值
```json
{
  "optimized_css": "string",
  "removed_rules": 15,
  "size_reduction": "45%"
}
```

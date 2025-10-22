---
name: note-linker
description: 智能笔记链接技能，自动发现相关笔记并建议链接位置
---

# Note Linker Skill

## 功能描述

智能分析笔记内容，自动发现相关笔记，建议链接位置，并维护链接的有效性。帮助用户构建紧密连接的知识网络。

## 输入参数

```json
{
  "note_path": "string",      // 当前笔记路径
  "vault_path": "string",     // Vault 根目录
  "action": "suggest|add|validate|update",  // 操作类型
  "options": {
    "min_similarity": 0.6,    // 最小相似度阈值 (0-1)
    "max_suggestions": 10,    // 最多建议数量
    "include_tags": true,     // 是否考虑标签匹配
    "include_content": true,  // 是否考虑内容相似度
    "exclude_patterns": []    // 排除的文件模式
  }
}
```

## 功能模块

### 1. 链接建议 (suggest)

分析当前笔记，建议可能相关的笔记和链接位置。

**分析维度**：
- **标签重叠**：共同标签数量和比例
- **内容相似度**：使用 TF-IDF 或关键词匹配
- **现有链接**：已有的共同链接笔记
- **时间接近度**：创建或更新时间的接近程度

**返回示例**：
```json
{
  "success": true,
  "note_path": "/Learning/React Hooks.md",
  "suggestions": [
    {
      "target_note": "/Learning/React 基础.md",
      "similarity": 0.85,
      "reasons": [
        "共同标签: #react #javascript",
        "内容关键词重叠度: 78%",
        "已有共同链接: [[React 官方文档]]"
      ],
      "suggested_locations": [
        {
          "line": 45,
          "context": "Hooks 是 React 16.8 引入的新特性",
          "suggestion": "可以在此处添加 [[React 基础]] 的链接"
        }
      ]
    },
    {
      "target_note": "/Learning/useState 详解.md",
      "similarity": 0.72,
      "reasons": [
        "内容高度相关: useState 是 Hooks 的核心概念"
      ],
      "suggested_locations": [
        {
          "line": 78,
          "context": "useState 是最常用的 Hook",
          "suggestion": "建议添加 [[useState 详解]] 进行深入阅读"
        }
      ]
    }
  ]
}
```

### 2. 自动添加链接 (add)

根据建议自动在笔记中添加链接。

**添加策略**：
- 在第一次出现关键词的位置添加链接
- 避免在同一段落重复添加相同链接
- 保持原文的可读性
- 不在代码块中添加链接

**输入参数**：
```json
{
  "note_path": "/Learning/React Hooks.md",
  "vault_path": "/vault",
  "action": "add",
  "links_to_add": [
    {
      "target_note": "React 基础",
      "keyword": "React 基础知识",
      "line": 45
    }
  ]
}
```

**返回值**：
```json
{
  "success": true,
  "added_links": 3,
  "updated_content": "string",
  "changes": [
    {
      "line": 45,
      "original": "React 基础知识包括组件、Props、State等",
      "modified": "[[React 基础|React 基础知识]]包括组件、Props、State等"
    }
  ]
}
```

### 3. 链接验证 (validate)

检查笔记中的所有链接是否有效。

**检查内容**：
- Wiki 链接目标是否存在
- 外部链接是否可访问（可选）
- 链接语法是否正确
- 链接是否指向正确的文件

**返回值**：
```json
{
  "success": true,
  "total_links": 15,
  "valid_links": 12,
  "broken_links": [
    {
      "line": 23,
      "link": "[[不存在的笔记]]",
      "issue": "目标文件不存在",
      "suggestions": [
        "创建新笔记: 不存在的笔记.md",
        "可能是: [[存在的笔记]]"
      ]
    },
    {
      "line": 67,
      "link": "[[旧笔记名]]",
      "issue": "文件已重命名",
      "suggestions": [
        "更新为: [[新笔记名]]"
      ]
    }
  ],
  "warnings": [
    {
      "line": 45,
      "link": "[[某笔记]]",
      "warning": "该笔记也引用了当前笔记，但链接文本不同"
    }
  ]
}
```

### 4. 链接更新 (update)

批量更新笔记中的链接（如笔记重命名后）。

**输入参数**：
```json
{
  "vault_path": "/vault",
  "action": "update",
  "updates": [
    {
      "old_name": "旧笔记名",
      "new_name": "新笔记名"
    }
  ]
}
```

**返回值**：
```json
{
  "success": true,
  "updated_files": 8,
  "total_updates": 15,
  "details": [
    {
      "file": "/Projects/项目A.md",
      "updates": 3,
      "changes": [
        "Line 12: [[旧笔记名]] → [[新笔记名]]",
        "Line 45: [[旧笔记名|别名]] → [[新笔记名|别名]]",
        "Line 78: [[旧笔记名]] → [[新笔记名]]"
      ]
    }
  ]
}
```

## 相似度计算算法

### 标签相似度
```
tag_similarity = (共同标签数 / 总标签数) * 权重(0.3)
```

### 内容相似度
使用 TF-IDF + 余弦相似度：
```javascript
function contentSimilarity(note1, note2) {
  const keywords1 = extractKeywords(note1);
  const keywords2 = extractKeywords(note2);

  // 计算 TF-IDF 向量
  const vector1 = computeTFIDF(keywords1, allNotes);
  const vector2 = computeTFIDF(keywords2, allNotes);

  // 余弦相似度
  return cosineSimilarity(vector1, vector2);
}
```

### 链接相似度
```
link_similarity = (共同链接数 / 总链接数) * 权重(0.2)
```

### 综合相似度
```
total_similarity =
  tag_similarity * 0.3 +
  content_similarity * 0.5 +
  link_similarity * 0.2
```

## 使用示例

### 示例 1：获取链接建议
```javascript
const suggestions = await noteLinker({
  note_path: "/Learning/React Hooks.md",
  vault_path: "/vault",
  action: "suggest",
  options: {
    min_similarity: 0.6,
    max_suggestions: 10
  }
});

console.log(`找到 ${suggestions.suggestions.length} 个相关笔记`);
```

### 示例 2：验证所有链接
```javascript
const validation = await noteLinker({
  note_path: "/Projects/项目总结.md",
  vault_path: "/vault",
  action: "validate"
});

if (validation.broken_links.length > 0) {
  console.log(`发现 ${validation.broken_links.length} 个断链`);
}
```

### 示例 3：批量更新链接
```javascript
await noteLinker({
  vault_path: "/vault",
  action: "update",
  updates: [
    { old_name: "React学习", new_name: "React 深入学习" }
  ]
});
```

## 配置选项

在 plugin.json 中配置：

```json
{
  "skills": {
    "note-linker": {
      "auto_suggest": true,
      "auto_validate_on_save": true,
      "similarity_threshold": 0.6,
      "max_suggestions_per_note": 10,
      "excluded_directories": [
        "Archive",
        "Templates"
      ],
      "link_style": "wiki"  // 'wiki' or 'markdown'
    }
  }
}
```

## 链接格式

支持两种链接格式：

### Wiki 链接（推荐）
```markdown
[[笔记名称]]
[[笔记名称|显示文本]]
[[目录/笔记名称]]
```

### Markdown 链接
```markdown
[显示文本](笔记名称.md)
[显示文本](./目录/笔记名称.md)
```

## 最佳实践

1. **定期验证链接**：每周运行链接验证，及时修复断链
2. **适度链接**：每个笔记保持 3-10 个有意义的链接
3. **使用别名**：为链接添加合适的显示文本
4. **双向链接**：重要关联应该建立双向链接
5. **避免循环**：注意避免 A→B→C→A 的循环引用

## 注意事项
- 自动添加链接前会询问用户确认
- 链接更新会保留链接的别名
- 不会在代码块、frontmatter 中添加链接
- 建议的相似度阈值为 0.6-0.8
- 大型 vault 中计算可能需要较长时间

## 性能优化

- 使用缓存存储笔记元数据
- 增量更新相似度计算
- 异步处理大批量操作
- 支持取消长时间运行的操作

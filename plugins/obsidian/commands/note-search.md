---
description: 在 Obsidian vault 中搜索笔记
---

# 搜索 Obsidian 笔记

你需要帮助用户在 Obsidian vault 中搜索笔记。提供全文搜索、标签过滤、时间范围筛选等功能。

## 参数
- 搜索关键词：$ARGUMENTS（可以是单个词或短语）

## 搜索步骤

1. **确定搜索条件**：
   - 搜索关键词（必需）
   - 标签过滤（可选）
   - 时间范围（可选：last-day, last-week, last-month, last-year, custom）
   - 搜索范围（可选：指定目录）

2. **执行搜索**：
   - 使用 Grep 工具在 vault 中搜索
   - 搜索 Markdown 文件（*.md）
   - 支持正则表达式搜索
   - 忽略大小写（除非用户特别指定）

3. **处理搜索结果**：
   - 按相关性排序结果
   - 显示匹配的上下文（前后各 2 行）
   - 高亮显示匹配的关键词
   - 显示笔记的 frontmatter 信息（标题、标签、创建时间）

4. **结果过滤**：
   如果用户指定了标签过滤：
   - 只显示包含指定标签的笔记
   - 支持多标签 AND/OR 逻辑

   如果用户指定了时间范围：
   - 根据笔记的创建或更新时间过滤
   - 支持相对时间（最近 N 天）和绝对时间范围

5. **展示结果**：
   ```markdown
   ## 搜索结果：[关键词]

   找到 N 个匹配的笔记：

   ### 1. [笔记标题](路径)
   **标签**：#tag1 #tag2
   **创建时间**：YYYY-MM-DD
   **匹配片段**：
   > ... 匹配的内容上下文 ...

   ### 2. [笔记标题](路径)
   ...
   ```

6. **提供后续操作**：
   - 询问是否需要打开某个笔记
   - 建议相关的搜索关键词
   - 提供精确搜索的选项

## 高级搜索功能

### 标签搜索
```
/note-search "关键词" --tags tech,javascript
/note-search "关键词" --tags-or reading,tech
```

### 时间范围搜索
```
/note-search "关键词" --time last-week
/note-search "关键词" --since 2025-01-01
/note-search "关键词" --between 2025-01-01,2025-01-31
```

### 目录限定搜索
```
/note-search "关键词" --dir Projects/
/note-search "关键词" --dir Daily Notes/
```

### 正则表达式搜索
```
/note-search "react.*hooks" --regex
```

## 搜索技巧

1. **精确短语搜索**：使用引号 `"exact phrase"`
2. **排除关键词**：使用减号 `-keyword`
3. **通配符搜索**：使用 `*` 或 `?`
4. **布尔搜索**：AND、OR、NOT 运算符

## 示例输出

```markdown
## 搜索结果："React Hooks"

找到 5 个匹配的笔记：

### 1. [学习 React Hooks](Projects/React/学习 React Hooks.md)
**标签**：#tech #react #javascript
**创建时间**：2025-01-15
**匹配片段**：
> React Hooks 是 React 16.8 引入的新特性，让你可以在不编写 class 的情况下使用 state 和其他 React 特性...

### 2. [React 进阶指南](Projects/React/React 进阶指南.md)
**标签**：#tech #react
**创建时间**：2025-01-10
**匹配片段**：
> ## Hooks 章节
>
> React Hooks 改变了我们编写组件的方式，主要包括 useState、useEffect、useContext 等...

---

**搜索建议**：
- 尝试搜索相关主题：`useState`, `useEffect`, `Custom Hooks`
- 限定标签范围：`--tags react,hooks`
- 查看最近的笔记：`--time last-month`
```

## 注意事项
- 搜索大型 vault 时可能需要一些时间
- 如果结果太多（>20个），建议用户缩小搜索范围
- 确保搜索路径指向正确的 Obsidian vault
- 尊重用户的隐私，不要展示敏感内容

## 示例用法
```
/note-search "React Hooks"
/note-search "项目管理" --tags work
/note-search "javascript" --time last-week
/note-search ".*模式$" --regex --dir Design Patterns/
```

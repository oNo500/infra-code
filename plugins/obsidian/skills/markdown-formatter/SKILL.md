---
name: markdown-formatter
description: Markdown 格式化技能，统一笔记格式风格
---

# Markdown Formatter Skill

## 功能描述

自动格式化 Markdown 文件，统一格式风格，优化表格和列表，处理代码块，确保笔记的一致性和可读性。

## 输入参数

```json
{
  "file_path": "string",  // 要格式化的文件路径
  "options": {
    "fix_headings": true,  // 修复标题格式
    "fix_lists": true,     // 修复列表格式
    "fix_tables": true,    // 修复表格对齐
    "fix_code_blocks": true, // 修复代码块
    "fix_links": true,     // 修复链接格式
    "remove_trailing_spaces": true, // 移除行尾空格
    "ensure_final_newline": true    // 确保文件末尾有换行
  }
}
```

## 格式化规则

### 1. 标题格式化
- 确保标题前后有空行
- 确保 `#` 后有一个空格
- 不允许跳级（如 H1 直接到 H3）

**修复前**：
```markdown
#标题一
## 标题二
###标题三
```

**修复后**：
```markdown
# 标题一

## 标题二

### 标题三
```

### 2. 列表格式化
- 统一使用 `-` 作为无序列表标记
- 确保列表项缩进一致（2 空格）
- 列表前后有空行

**修复前**：
```markdown
* 项目 1
- 项目 2
  * 子项目 2.1
+ 项目 3
```

**修复后**：
```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
- 项目 3
```

### 3. 表格格式化
- 自动对齐表格列
- 确保表头分隔线正确
- 表格前后有空行

**修复前**：
```markdown
|Name|Age|City|
|---|---|---|
|Alice|30|NYC|
|Bob|25|LA|
```

**修复后**:
```markdown
| Name  | Age | City |
|-------|-----|------|
| Alice | 30  | NYC  |
| Bob   | 25  | LA   |
```

### 4. 代码块格式化
- 确保代码块使用正确的语言标识
- 代码块前后有空行
- 统一使用三个反引号

**修复前**：
```
```js
function hello() {
  console.log("Hello");
}
```
```

**修复后**：
```markdown
```javascript
function hello() {
  console.log("Hello");
}
```
```

### 5. 链接格式化
- 统一 Wiki 链接格式：`[[笔记名称]]`
- 修复断行的链接
- 确保链接文本和 URL 正确

**修复前**：
```markdown
[[笔记名称 ]]
[[ 笔记名称]]
[链接](https://
example.com)
```

**修复后**：
```markdown
[[笔记名称]]
[[笔记名称]]
[链接](https://example.com)
```

### 6. 其他格式
- 移除行尾空格
- 统一行尾为 LF（\n）
- 确保文件末尾有且只有一个换行
- 修复连续多个空行（最多保留 2 个）

## 返回值

```json
{
  "success": true,
  "file_path": "string",
  "changes": {
    "headings_fixed": 3,
    "lists_fixed": 5,
    "tables_fixed": 2,
    "code_blocks_fixed": 1,
    "links_fixed": 4,
    "trailing_spaces_removed": 12,
    "blank_lines_normalized": 6
  },
  "formatted_content": "string"
}
```

## 使用示例

```javascript
const result = await formatMarkdown({
  file_path: "/path/to/note.md",
  options: {
    fix_headings: true,
    fix_lists: true,
    fix_tables: true,
    fix_code_blocks: true,
    fix_links: true,
    remove_trailing_spaces: true,
    ensure_final_newline: true
  }
});

console.log(`格式化完成，修复了 ${result.changes.headings_fixed} 个标题`);
```

## 配置选项

可以在 plugin.json 中配置默认选项：

```json
{
  "skills": {
    "markdown-formatter": {
      "auto_format_on_save": true,
      "format_options": {
        "list_marker": "-",
        "heading_style": "atx",
        "code_block_style": "fenced",
        "emphasis_marker": "*",
        "strong_marker": "**"
      }
    }
  }
}
```

## 注意事项
- 格式化前会自动备份原文件
- 保留文件的原始编码（UTF-8）
- 不会修改代码块内部的内容
- 不会修改 frontmatter 的格式
- 对于复杂表格可能需要手动调整

# Obsidian Plugin

Obsidian 知识库管理工具集，为 Claude Code 提供强大的 Obsidian vault 管理能力，包括笔记创建、搜索、链接管理和知识组织。

## 功能特性

### 📝 Commands（斜杠命令）

- **`/note-create`** - 创建新的 Obsidian 笔记
  - 支持多种模板（日记、会议、技术、读书笔记）
  - 自动生成 frontmatter
  - 智能标签建议

- **`/note-search`** - 在 vault 中搜索笔记
  - 全文搜索
  - 标签过滤
  - 时间范围筛选
  - 正则表达式支持

- **`/note-link`** - 管理笔记链接
  - 查找双向链接
  - 检测断链
  - 建议相关笔记

- **`/note-sync`** - 同步 vault 并进行版本控制
  - Git 集成
  - 自动提交和推送
  - 冲突处理

### 🤖 Agents（智能代理）

- **`knowledge-organizer`** - 知识组织专家
  - 分析 vault 结构
  - 优化标签体系
  - 识别知识孤岛
  - 优化知识图谱

- **`note-summarizer`** - 笔记总结专家
  - 生成笔记摘要
  - 提取关键概念
  - 创建思维导图
  - 生成每日/每周/每月总结

### ⚡ Skills（技能）

- **`markdown-formatter`** - Markdown 格式化
  - 统一格式风格
  - 优化表格和列表
  - 处理代码块

- **`note-linker`** - 智能链接管理
  - 自动发现相关笔记
  - 建议链接位置
  - 维护链接有效性

### 🔗 Hooks（事件钩子）

- **PostToolUse** (Write/Edit)
  - 自动格式化 Markdown
  - 更新笔记时间戳
  - 更新链接关系

- **PreToolUse** (Git 操作)
  - 验证笔记完整性
  - 检查敏感信息

### 🌐 MCP Servers

- **filesystem** - 文件系统访问
  - 读写 vault 文件
  - 目录管理

## 安装

### 方式 1：从插件市场安装

```bash
claude
/plugin marketplace add https://github.com/your-org/code-infra
/plugin install obsidian@code-infra
```

### 方式 2：本地开发安装

```bash
cd /path/to/code-infra
claude
/plugin marketplace add .
/plugin install obsidian@local
```

## 配置

### 环境变量

创建 `.env` 文件或在系统中设置：

```bash
# Obsidian vault 路径（必需）
export OBSIDIAN_VAULT_PATH="/path/to/your/obsidian/vault"

# Git 用户信息（用于 note-sync）
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your@email.com"
```

### 插件配置

在 `.claude/settings.json` 中配置插件行为：

```json
{
  "plugins": {
    "obsidian": {
      "vault_path": "/path/to/your/vault",
      "default_template": "daily",
      "auto_format": true,
      "auto_link_suggest": true,
      "git_auto_sync": false
    }
  }
}
```

## 使用指南

### 创建笔记

```bash
# 使用默认模板创建笔记
/note-create "我的新笔记"

# 使用技术笔记模板
/note-create "学习 React Hooks" tech

# 使用日记模板
/note-create "2025-01-15 日记" daily
```

### 搜索笔记

```bash
# 全文搜索
/note-search "React Hooks"

# 带标签过滤
/note-search "React" --tags tech,javascript

# 限定时间范围
/note-search "项目" --time last-week

# 在特定目录中搜索
/note-search "笔记" --dir Projects/
```

### 管理链接

```bash
# 查看笔记的双向链接
/note-link "Projects/React 学习.md" backlinks

# 检测断链
/note-link broken

# 获取相关笔记建议
/note-link "Learning/JavaScript.md" suggest
```

### 同步 Vault

```bash
# 查看同步状态
/note-sync status

# 完整同步（拉取 + 提交 + 推送）
/note-sync sync

# 仅提交
/note-sync commit "更新学习笔记"

# 仅推送
/note-sync push
```

### 使用 Agents

```bash
# 分析 vault 结构
请分析我的 Obsidian vault 结构

# 优化标签体系
优化我的笔记标签体系

# 生成每周总结
生成本周的笔记总结

# 为笔记创建思维导图
为 [[React Hooks]] 创建思维导图
```

## 工作流示例

### 每日笔记工作流

```bash
# 1. 创建今天的日记
/note-create "2025-01-15 日记" daily

# 2. 编辑笔记内容
# ... Claude Code 会自动格式化

# 3. 链接相关笔记
/note-link suggest

# 4. 结束时同步
/note-sync sync
```

### 知识整理工作流

```bash
# 1. 分析 vault 结构
请分析我的知识库结构并给出优化建议

# 2. 查找孤立笔记
找出我的知识库中的孤立笔记

# 3. 建立链接关系
/note-link "Learning/某笔记.md" suggest

# 4. 生成知识图谱
帮我优化知识图谱
```

### 项目总结工作流

```bash
# 1. 搜索相关笔记
/note-search "项目名称" --dir Projects/

# 2. 生成项目总结
请总结 [[项目名称]] 相关的所有笔记

# 3. 创建思维导图
为项目创建思维导图

# 4. 归档笔记
/note-sync commit "完成项目总结"
```

## 最佳实践

### 笔记组织

1. **合理的目录结构**
   ```
   vault/
   ├── Daily Notes/    # 每日笔记
   ├── Projects/       # 项目笔记
   ├── Learning/       # 学习笔记
   ├── Reading/        # 读书笔记
   ├── Inbox/          # 临时笔记
   └── Archive/        # 归档笔记
   ```

2. **统一的命名规范**
   - 使用清晰描述性的标题
   - 避免特殊字符
   - 日期使用 YYYY-MM-DD 格式

3. **适度的标签使用**
   - 每个笔记 2-5 个标签
   - 使用层级标签：`#tech/react`
   - 保持标签一致性

### 链接策略

1. **适度链接**：每个笔记 3-10 个有意义的链接
2. **双向链接**：重要关联建立双向链接
3. **定期维护**：每周检查断链
4. **使用别名**：`[[笔记|显示文本]]`

### Git 同步

1. **每日同步**：工作结束时运行 `/note-sync sync`
2. **有意义的提交信息**：描述具体更改
3. **定期备份**：每周创建 Git tag
4. **多设备使用**：开始工作前先 pull

## 故障排查

### 问题：找不到 vault

**症状**：命令报错 "Vault not found"

**解决方案**：
```bash
# 设置环境变量
export OBSIDIAN_VAULT_PATH="/path/to/vault"

# 或在配置文件中设置
```

### 问题：Git 操作失败

**症状**：同步命令报错

**解决方案**：
```bash
# 检查 Git 配置
git config --list

# 设置用户信息
git config user.name "Your Name"
git config user.email "your@email.com"
```

### 问题：链接建议不准确

**症状**：建议的相关笔记不相关

**解决方案**：
- 调整相似度阈值（默认 0.6）
- 完善笔记的标签
- 增加笔记间的现有链接

## 开发和贡献

### 项目结构

```
plugins/obsidian/
├── .claude-plugin/
│   └── plugin.json          # 插件配置
├── commands/                 # 斜杠命令
│   ├── note-create.md
│   ├── note-search.md
│   ├── note-link.md
│   └── note-sync.md
├── agents/                   # 智能代理
│   ├── knowledge-organizer.md
│   └── note-summarizer.md
├── skills/                   # 技能
│   ├── markdown-formatter/
│   └── note-linker/
├── hooks/                    # 钩子
│   └── hooks.json
├── .mcp.json                 # MCP 配置
├── README.md
└── CHANGELOG.md
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-org/code-infra
cd code-infra/plugins/obsidian

# 安装依赖
npm install

# 测试
npm test

# 本地安装插件
claude
/plugin marketplace add ../..
/plugin install obsidian@local
```

### 贡献指南

1. Fork 仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

## 版本历史

详见 [CHANGELOG.md](./CHANGELOG.md)

## 许可证

MIT License

## 支持

- 📖 文档：[链接]
- 🐛 报告问题：[GitHub Issues]
- 💬 讨论：[GitHub Discussions]
- 📧 联系：your@email.com

## 致谢

- [Obsidian](https://obsidian.md/) - 强大的知识管理工具
- [Claude Code](https://claude.com/code) - AI 编程助手
- 所有贡献者

---

**Happy note-taking with Obsidian and Claude Code!** 📝✨

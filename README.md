# Claude Code Plugins



## 插件参考

```
enterprise-plugin/
├── .claude-plugin/           # Metadata directory
│   └── plugin.json          # Required: plugin manifest
├── commands/                 # Default command location
│   ├── status.md
│   └──  logs.md
├── agents/                   # Default agent location
│   ├── security-reviewer.md
│   ├── performance-tester.md
│   └── compliance-checker.md
├── skills/                   # Agent Skills
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── hooks/                    # Hook configurations
│   ├── hooks.json           # Main hook config
│   └── security-hooks.json  # Additional hooks
├── .mcp.json                # MCP server definitions
├── scripts/                 # Hook and utility scripts
│   ├── security-scan.sh
│   ├── format-code.py
│   └── deploy.js
├── LICENSE                  # License file
└── CHANGELOG.md             # Version history
```

## plugins 规划
个人有一个 obsidian 的知识库，所以需要围绕这个 obsidian 来构建一个 plugin
比较擅长前端开发所以可以构建前端的 plugin，但是前端设计的技术栈太多了...暂且一个 fe 吧，主要是围绕 web 方向
在研究 nodejs 后端开发也需要 一个 plugin
正在进行全栈开发，也需要一个全栈的 plugin
正在构建脚手架提升 DX的项目，需要一个 plugin 么？
我还需要一个简单的通用的 plugin 以满足我日常的使用



  📁 完整项目结构
```
  code-infra/
  ├── .claude-plugin/
  │   └── marketplace.json              # 市场配置（已更新）
  │
  ├── .claude/
  │   └── settings.json                 # 项目配置
  │
  ├── plugins/
  │   ├── x/                           # 个人定制工具 ✅ 已存在
  │   │   ├── .claude-plugin/
  │   │   │   └── plugin.json
  │   │   ├── commands/
  │   │   │   └── hello.md
  │   │   ├── agents/
  │   │   ├── skills/
  │   │   ├── hooks/
  │   │   ├── scripts/
  │   │   ├── .mcp.json
  │   │   ├── README.md
  │   │   └── CHANGELOG.md
  │   │
  │   ├── obsidian/                    # Obsidian 知识库管理 🆕
  │   │   ├── .claude-plugin/
  │   │   │   └── plugin.json
  │   │   ├── commands/
  │   │   │   ├── note-create.md       # 创建笔记
  │   │   │   ├── note-search.md       # 搜索笔记
  │   │   │   ├── note-link.md         # 链接管理
  │   │   │   └── note-sync.md         # 同步整理
  │   │   ├── agents/
  │   │   │   ├── knowledge-organizer.md    # 知识组织专家
  │   │   │   └── note-summarizer.md        # 笔记摘要生成
  │   │   ├── skills/
  │   │   │   ├── note-linker/
  │   │   │   │   └── SKILL.md              # 自动双向链接
  │   │   │   └── markdown-formatter/
  │   │   │       └── SKILL.md              # Markdown 格式化
  │   │   ├── hooks/
  │   │   │   └── hooks.json                # SessionStart 钩子
  │   │   ├── scripts/
  │   │   ├── .mcp.json                     # Obsidian API 连接
  │   │   ├── README.md
  │   │   └── CHANGELOG.md
  │   │
  │   ├── web-dev/                     # 现代前端开发 🆕
  │   │   ├── .claude-plugin/
  │   │   │   └── plugin.json
  │   │   ├── commands/
  │   │   │   ├── component.md         # React 组件生成
  │   │   │   ├── page.md              # 页面生成
  │   │   │   ├── style.md             # 样式文件生成
  │   │   │   └── build.md             # 构建优化
  │   │   ├── agents/
  │   │   │   ├── ui-reviewer.md       # UI/UX 审查专家
  │   │   │   └── performance-optimizer.md  # 性能优化
  │   │   ├── skills/
  │   │   │   ├── component-generator/
  │   │   │   │   └── SKILL.md         # 智能组件生成
  │   │   │   └── css-optimizer/
  │   │   │       └── SKILL.md         # CSS 优化
  │   │   ├── hooks/
  │   │   │   └── hooks.json           # 代码格式化钩子
  │   │   ├── scripts/
  │   │   │   └── format-code.sh       # 格式化脚本
  │   │   ├── README.md
  │   │   └── CHANGELOG.md
  │   │
  │   ├── nodejs/                      # Node.js 后端开发 🆕
  │   │   ├── .claude-plugin/
  │   │   │   └── plugin.json
  │   │   ├── commands/
  │   │   │   ├── api.md               # API 路由生成
  │   │   │   ├── model.md             # 数据模型生成
  │   │   │   ├── middleware.md        # 中间件生成
  │   │   │   └── test-api.md          # API 测试
  │   │   ├── agents/
  │   │   │   ├── api-designer.md      # API 设计专家
  │   │   │   └── security-auditor.md  # 安全审计
  │   │   ├── skills/
  │   │   │   ├── error-handler/
  │   │   │   │   └── SKILL.md         # 错误处理生成
  │   │   │   └── validation-builder/
  │   │   │       └── SKILL.md         # 验证逻辑生成
  │   │   ├── hooks/
  │   │   │   └── hooks.json
  │   │   ├── scripts/
  │   │   ├── README.md
  │   │   └── CHANGELOG.md
  │   │
  │   ├── fullstack/                   # 全栈工具集 🆕
  │   │   ├── .claude-plugin/
  │   │   │   └── plugin.json
  │   │   ├── commands/
  │   │   │   ├── project.md           # 全栈项目初始化
  │   │   │   ├── feature.md           # 端到端功能开发
  │   │   │   ├── deploy.md            # 部署流程
  │   │   │   └── connect.md           # 前后端连接
  │   │   ├── agents/
  │   │   │   ├── fullstack-architect.md    # 全栈架构师
  │   │   │   └── deployment-expert.md      # 部署专家
  │   │   ├── skills/
  │   │   │   ├── api-connector/
  │   │   │   │   └── SKILL.md              # API 集成
  │   │   │   └── project-initializer/
  │   │   │       └── SKILL.md              # 项目初始化
  │   │   ├── hooks/
  │   │   │   └── hooks.json                # 部署前检查
  │   │   ├── scripts/
  │   │   │   ├── check-dockerfile.sh       # Docker 检查
  │   │   │   ├── backup-db.sh              # 数据库备份
  │   │   │   └── notify-deploy.sh          # 部署通知
  │   │   ├── .mcp.json
  │   │   ├── README.md
  │   │   └── CHANGELOG.md
  │   │
  │   └── cli-dx/                      # 脚手架 DX 工具 🆕
  │       ├── .claude-plugin/
  │       │   └── plugin.json
  │       ├── commands/
  │       │   ├── scaffold.md          # 项目脚手架生成
  │       │   ├── template.md          # 模板管理
  │       │   ├── config.md            # 配置向导
  │       │   └── upgrade.md           # 项目升级
  │       ├── agents/
  │       │   ├── template-designer.md # 模板设计专家
  │       │   └── dx-optimizer.md      # DX 优化顾问
  │       ├── skills/
  │       │   ├── config-generator/
  │       │   │   └── SKILL.md         # 配置生成
  │       │   └── template-renderer/
  │       │       └── SKILL.md         # 模板渲染
  │       ├── hooks/
  │       │   └── hooks.json
  │       ├── scripts/
  │       │   ├── validate-template.sh # 模板验证
  │       │   └── init-project.sh      # 项目初始化
  │       ├── templates/               # 模板目录
  │       │   ├── react-app/
  │       │   ├── node-api/
  │       │   └── fullstack/
  │       ├── .mcp.json                # 文件系统和模板库连接
  │       ├── README.md
  │       └── CHANGELOG.md
  │
  ├── docs/                            # 文档目录 ✅ 已存在
  │   ├── README.md
  │   ├── plugin-development.md
  │   ├── marketplace-configuration.md
  │   └── ...
  │
  ├── README.md                        # 主 README
  ├── CHANGELOG.md                     # 变更日志
  └── CLAUDE.md                        # Claude 指令文档
```
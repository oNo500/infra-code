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
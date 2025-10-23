# 计划

1. 默认使用 project scope，这样可以将 MCP 配置独立出来
2. 需要添加插件预设
3. MCP 安装是检查对应的环境变量，如果没有的话，进行配置提示




---
禁用mcp

   "disabledMcpServers": [
        "plugin:common:brave-search"
      ]


---
全局配置检查清单（最佳实践）
场景：
1. 电脑重置/使用一台权限的电脑，需要重新配置
2. 新开一个项目，需要配置项目级别的

根据 claude code 的最佳时间，列一个检查清单
需要一个 init 配置，初始化 claude code/claude desktop 的全局配置
包括
1. claude.md
2. 全局 setting 的配置
3. 全局 claude.json？ 这个是干嘛的我看好多东西都在里边，与 setting 有什么区别呢
4. 项目初始化场景配置
5. 检查清单。。。
6. 使用终端配置验证是否配置成功

---
mcp和plugins 预设


关系
setting | claude.md | .claude.json?
plugins | MCP
setting 需要启用默认的插件和mcp
预设 plugins 和 mcp 快速设置
是否需要分场景进行 plugins和mcp的预设？
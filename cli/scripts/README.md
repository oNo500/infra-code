# 模板生成系统

这个目录包含了自动生成 Claude Settings 模板文件的配置和脚本。

## 文件结构

```
scripts/
├── README.md                    # 本文档
├── mcp-servers.config.ts        # MCP 服务器库配置
├── templates.config.ts          # 模板配置
└── generate-templates.ts        # 生成脚本
```

## 配置文件说明

### mcp-servers.config.ts

定义所有可复用的 MCP 服务器配置。每个服务器包含：
- `command`: 执行命令（如 "npx", "uvx"）
- `args`: 命令参数数组
- `env`: 环境变量（可选）
- `type`: 类型（可选）

**添加新的 MCP 服务器**：
```typescript
export const mcpServers = {
  'my-server': {
    command: 'npx',
    args: ['-y', '@scope/my-mcp-server'],
    env: {
      API_KEY: 'your-api-key',
    },
  },
  // ... 其他服务器
}
```

### templates.config.ts

定义所有模板的配置，包括：
- `metadata`: 模板元数据（名称、描述、版本等）
- `config`: Claude Settings 配置
- `mcpServers`: 使用的 MCP 服务器列表（引用 mcp-servers.config.ts）
- `claudeMdContent`: Claude.md 的内容（可选）

**添加新模板**：
```typescript
export const templates = {
  'my-template': {
    metadata: {
      name: 'my-template',
      description: '我的自定义模板',
      version: '1.0.0',
      supportedScopes: ['user', 'project', 'local'],
      mcpConfig: 'my-template.mcp.json',
      claudeMd: 'my-template.claude.md',
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: ['sequential-thinking', 'brave-search'],
    claudeMdContent: '# 我的模板\n\n待补充',
  },
}
```

### generate-templates.ts

生成脚本，根据配置文件自动生成三类文件：
1. `{name}.json` - 模板定义文件
2. `{name}.mcp.json` - MCP 服务器配置文件
3. `{name}.claude.md` - Claude 提示词文档

**特性**：
- 支持 MCP 服务器名称映射（通过 `MCP_SERVER_NAME_MAPPING`）
- 自动跳过不存在 `mcpConfig` 的模板
- 对于 `plugins` 模板，保持现有的 claude.md 文件

## 使用方法

### 手动生成模板

```bash
cd cli
pnpm generate:templates
```

### 自动生成

模板会在以下情况自动生成：
- **构建时**：运行 `pnpm build` 前会自动生成
- **开发时**：运行 `pnpm dev` 前会自动生成

### 修改模板配置

1. 编辑 `scripts/templates.config.ts` 或 `scripts/mcp-servers.config.ts`
2. 运行 `pnpm generate:templates`
3. 验证生成的文件是否正确
4. 提交更改到版本控制

## 工作流程

### 添加新的 MCP 服务器

1. 在 `mcp-servers.config.ts` 中添加服务器配置
2. 在需要的模板的 `mcpServers` 数组中添加服务器名称
3. 运行生成脚本
4. 验证生成的 `.mcp.json` 文件

### 修改现有模板

1. 编辑 `templates.config.ts` 中对应模板的配置
2. 运行生成脚本
3. 检查 `cli/templates/` 目录中生成的文件
4. 提交更改

### 添加新模板

1. 在 `templates.config.ts` 中添加新模板配置
2. （可选）创建对应的 `.claude.md` 文件到 `cli/templates/`
3. 运行生成脚本
4. 验证生成的三个文件
5. 更新 CLI 代码以支持新模板（如果需要）

## 注意事项

### MCP 服务器名称映射

某些模板可能需要使用相同的服务器名称但配置不同。例如：
- `common` 模板使用 `serena`（npx 版本）
- `full` 模板也使用 `serena`（uvx 版本）

解决方案：在 `mcp-servers.config.ts` 中使用不同的内部名称（如 `serena-uvx`），然后在 `generate-templates.ts` 的 `MCP_SERVER_NAME_MAPPING` 中映射到输出名称。

### 长内容的 Claude.md

对于内容较长的 `.claude.md` 文件（如 `plugins.claude.md`），保留为独立文件而不是在配置中内联。生成脚本会自动保持现有文件。

### 验证生成的文件

始终验证生成的 JSON 文件格式是否正确：
```bash
for file in *.json *.mcp.json; do
  echo -n "$file: "
  if jq . "$file" > /dev/null 2>&1; then
    echo "✓"
  else
    echo "✗"
  fi
done
```

## 常见问题

**Q: 生成的文件会覆盖手动修改吗？**
A: 是的。所有配置应该在 `templates.config.ts` 和 `mcp-servers.config.ts` 中维护。生成的文件会被完全覆盖。

**Q: 如何排除某个模板不生成 MCP 配置？**
A: 在模板的 `metadata` 中不设置 `mcpConfig` 字段即可。

**Q: 可以为单个模板自定义 MCP 服务器配置吗？**
A: 可以。在 `templates.config.ts` 中设置 `mcpServers` 为该模板特定的服务器列表。

**Q: 为什么 plugins.claude.md 没有被覆盖？**
A: 生成脚本对 `plugins` 模板做了特殊处理，保留现有的 claude.md 文件（因为内容较长且复杂）。

## 开发建议

1. **集中管理**：所有配置集中在两个配置文件中，便于维护
2. **复用性**：MCP 服务器配置可在多个模板间共享
3. **版本控制**：生成的文件提交到 Git，确保团队一致性
4. **自动化**：集成到构建流程，减少手动操作
5. **验证**：每次生成后验证 JSON 格式和内容正确性

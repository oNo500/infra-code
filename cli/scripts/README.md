# 模板生成系统

这个目录包含了自动生成 Claude Settings 模板文件的配置和脚本。

## 文件结构

```
scripts/
├── README.md                    # 本文档
├── full.mcp.json                # MCP 服务器数据源（所有可用的 MCP 服务器）
├── templates.config.ts          # 模板配置
└── generate-templates.ts        # 生成脚本
```

## 核心概念

### 数据源：full.mcp.json

`full.mcp.json` 是所有 MCP 服务器配置的单一数据源。它包含了项目中使用的所有 MCP 服务器的完整配置。

**示例**：
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@brave/brave-search-mcp-server", "--transport", "stdio"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 模板配置：templates.config.ts

定义所有模板的配置。每个模板只需要指定：
- **metadata**: 模板元数据（名称、描述、版本等）
- **config**: Claude Settings 配置
- **mcpServers**: 要使用的 MCP 服务器名称列表（从 full.mcp.json 中筛选）

**mcpServers 的三种模式**：
1. `undefined` - 包含所有服务器（用于 full 模板）
2. `['server1', 'server2']` - 只包含指定的服务器
3. `[]` - 空数组，不包含任何服务器（用于 yolo 模板）

### 生成脚本：generate-templates.ts

从 `full.mcp.json` 读取数据，根据每个模板的 `mcpServers` 配置筛选服务器，生成三类文件：
1. `{name}.json` - 模板定义文件
2. `{name}.mcp.json` - MCP 服务器配置文件（从 full.mcp.json 筛选）
3. `{name}.claude.md` - Claude 提示词文档

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

## 工作流程

### 添加新的 MCP 服务器

**步骤 1**: 在 `full.mcp.json` 中添加服务器配置

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@scope/my-mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    },
    // ... 其他服务器
  }
}
```

**步骤 2**: 在需要的模板中引用服务器名称

在 `templates.config.ts` 中，将服务器名称添加到模板的 `mcpServers` 数组：

```typescript
{
  basic: {
    // ...
    mcpServers: ['sequential-thinking', 'brave-search', 'my-server'],
  }
}
```

**步骤 3**: 生成并验证

```bash
pnpm generate:templates
```

### 添加新模板

**步骤 1**: 在 `templates.config.ts` 中添加模板配置

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
    // 从 full.mcp.json 中选择需要的服务器
    mcpServers: ['sequential-thinking', 'brave-search'],
    claudeMdContent: '# 我的模板\n\n待补充',
  },
}
```

**步骤 2**: 生成模板文件

```bash
pnpm generate:templates
```

**步骤 3**: 验证生成的文件

```bash
# 检查 JSON 格式
jq . cli/templates/my-template.json
jq . cli/templates/my-template.mcp.json

# 查看生成的 MCP 服务器列表
jq '.mcpServers | keys' cli/templates/my-template.mcp.json
```

### 修改现有模板

**步骤 1**: 编辑 `templates.config.ts` 中对应模板的配置

例如，为 basic 模板添加新的 MCP 服务器：

```typescript
basic: {
  // ...
  mcpServers: [
    'sequential-thinking',
    'brave-search',
    'context7',
    'firecrawl-mcp',
    'new-server',  // 新增
  ],
}
```

**步骤 2**: 重新生成

```bash
pnpm generate:templates
```

**步骤 3**: 验证更改

```bash
git diff cli/templates/basic.mcp.json
```

## 模板示例

### Full 模板（包含所有服务器）

```typescript
full: {
  metadata: {
    name: 'full',
    description: '完整配置 - 包含所有 MCP 服务器',
    // ...
  },
  config: { /* ... */ },
  // undefined 表示包含 full.mcp.json 中的所有服务器
  mcpServers: undefined,
}
```

### Basic 模板（指定服务器）

```typescript
basic: {
  metadata: {
    name: 'basic',
    description: '基础配置 - 核心 MCP 服务器',
    // ...
  },
  config: { /* ... */ },
  // 只包含这些服务器
  mcpServers: ['sequential-thinking', 'brave-search', 'context7', 'firecrawl-mcp'],
}
```

### Yolo 模板（无服务器）

```typescript
yolo: {
  metadata: {
    name: 'yolo',
    description: '完全开放权限，用于快速实验',
    // ...
  },
  config: { /* ... */ },
  // 空数组 = 不包含任何 MCP 服务器
  mcpServers: [],
}
```

## 优势

### 相比之前的方案

**之前的方案**：
- 在 `mcp-servers.config.ts` 中维护每个 MCP 服务器的详细配置
- 需要手动管理服务器名称映射
- 配置分散在两个文件中

**当前方案**：
- ✅ **单一数据源**：所有 MCP 服务器配置在 `full.mcp.json` 中
- ✅ **简化配置**：模板中只需列出服务器名称
- ✅ **易于维护**：添加新服务器只需修改一个文件
- ✅ **更直观**：配置结构清晰，易于理解
- ✅ **自动筛选**：生成脚本自动从数据源筛选需要的服务器

## 常见问题

**Q: 如何为单个模板添加自定义 MCP 服务器？**

A: 有两种方式：
1. 如果这个服务器可能被其他模板复用，添加到 `full.mcp.json`
2. 如果这是模板特定的，可以在生成后手动编辑 `.mcp.json` 文件（但下次生成会被覆盖）

推荐使用方式 1，将所有可能用到的 MCP 服务器都添加到 `full.mcp.json` 中。

**Q: 为什么要把所有服务器都放在 full.mcp.json 中？**

A: 这样做的好处是：
- 统一管理所有 MCP 服务器配置
- 避免重复定义相同的服务器
- 便于查看项目中使用的所有 MCP 服务器
- 模板配置更简洁

**Q: 生成的文件会覆盖手动修改吗？**

A: 是的。所有配置应该在 `full.mcp.json` 和 `templates.config.ts` 中维护。生成的文件会被完全覆盖。

**Q: 如何排除某个模板不生成 MCP 配置？**

A: 在模板的 `metadata` 中不设置 `mcpConfig` 字段即可（参考 plugins 模板）。

**Q: full.mcp.json 是从哪里来的？**

A: 它是从 `cli/templates/full.mcp.json` 复制过来的，包含了项目中所有使用的 MCP 服务器。

**Q: 添加新 MCP 服务器后，如何确保其他模板不受影响？**

A: 只要不在其他模板的 `mcpServers` 数组中添加新服务器的名称，就不会影响其他模板。

## 验证和调试

### 验证 JSON 格式

```bash
# 验证所有生成的 JSON 文件
for file in *.json *.mcp.json; do
  echo -n "$file: "
  if jq . "$file" > /dev/null 2>&1; then
    echo "✓"
  else
    echo "✗"
  fi
done
```

### 查看模板使用的服务器

```bash
# 查看 basic 模板使用了哪些服务器
jq '.mcpServers | keys' cli/templates/basic.mcp.json

# 统计每个模板的服务器数量
for file in *.mcp.json; do
  count=$(jq '.mcpServers | length' "$file")
  echo "$file: $count 个服务器"
done
```

### 比较模板差异

```bash
# 比较两个模板的 MCP 服务器差异
diff <(jq -S '.mcpServers | keys' basic.mcp.json) \
     <(jq -S '.mcpServers | keys' fe.mcp.json)
```

## 开发建议

1. **集中管理**：所有 MCP 服务器配置集中在 `full.mcp.json`
2. **命名规范**：MCP 服务器名称使用小写字母和连字符（如 `sequential-thinking`）
3. **版本控制**：生成的文件提交到 Git，确保团队一致性
4. **自动化**：依赖构建流程自动生成，减少手动操作
5. **验证**：每次生成后验证 JSON 格式和内容正确性
6. **文档同步**：更新 MCP 服务器时，同步更新相关文档

# Web-Dev Plugin

现代前端 Web 开发工具集，为 Claude Code 提供全面的前端开发支持，包括组件创建、页面构建、样式管理和性能优化。

## 🚀 功能特性

### 📝 Commands（斜杠命令）

- **`/component`** - 创建组件
  - 支持 React/Vue/Svelte
  - 自动生成 TypeScript 类型
  - 创建样式和测试文件
  - 更新导出索引

- **`/page`** - 创建页面
  - 自动配置路由
  - 布局模板选择
  - SEO 元数据生成
  - 数据获取配置

- **`/style`** - 样式管理
  - CSS/SCSS/Tailwind 支持
  - 主题配置（亮色/暗色）
  - 响应式断点
  - CSS 变量管理

- **`/build`** - 构建优化
  - Bundle 大小分析
  - 性能指标报告
  - 优化建议
  - 缓存策略

### 🤖 Agents（智能代理）

- **`ui-reviewer`** - UI 审查专家
  - 设计一致性检查
  - 响应式布局验证
  - 可访问性审查
  - 跨浏览器兼容性

- **`performance-optimizer`** - 性能优化专家
  - 性能瓶颈分析
  - 优化建议生成
  - Core Web Vitals 监控
  - 代码分割策略

### ⚡ Skills（技能）

- **`component-generator`** - 组件生成器
  - 从设计生成代码
  - Props 类型推断
  - 样式提取

- **`css-optimizer`** - CSS 优化器
  - 移除未使用样式
  - 合并重复规则
  - CSS 压缩

### 🔗 Hooks（事件钩子）

- **PostToolUse** (Write/Edit)
  - 自动运行 Prettier
  - ESLint 自动修复

- **PreToolUse** (Build)
  - 依赖完整性检查
  - 环境变量验证

### 🌐 MCP Servers

- **filesystem** - 文件系统访问

## 📦 安装

```bash
claude
/plugin marketplace add https://github.com/your-org/code-infra
/plugin install web-dev@code-infra
```

## 🎯 快速开始

### 创建 React 组件

```bash
/component UserProfile react
```

生成的文件：
- `UserProfile.tsx` - 组件代码
- `UserProfile.module.css` - 样式文件
- `UserProfile.test.tsx` - 测试文件

### 创建页面

```bash
/page Dashboard --layout dashboard --with-seo
```

### 样式管理

```bash
# 切换暗色主题
/style theme dark

# 设置断点
/style breakpoint tablet:1024px

# 更新 CSS 变量
/style variable --primary:#3b82f6
```

### 构建优化

```bash
# 分析 bundle 大小
/build analyze

# 生成优化建议
/build optimize

# 查看性能报告
/build report
```

## 🛠️ 配置

在项目根目录创建 `.webdevrc.json`：

```json
{
  "framework": "react",
  "typescript": true,
  "styleApproach": "css-modules",
  "testFramework": "jest",
  "componentDirectory": "src/components",
  "pageDirectory": "src/pages"
}
```

## 📖 使用指南

### 工作流示例

#### 新功能开发
```bash
# 1. 创建组件
/component FeatureCard react

# 2. UI 审查
审查 FeatureCard 组件的可访问性

# 3. 性能检查
分析 FeatureCard 的渲染性能

# 4. 构建优化
/build optimize
```

#### 性能优化
```bash
# 1. 分析现状
/build analyze

# 2. 获取建议
优化首屏加载时间

# 3. 实施优化
# ... 根据建议修改代码

# 4. 验证效果
/build report
```

## 🎨 支持的技术栈

### 框架
- ✅ React 18+
- ✅ Vue 3
- ✅ Svelte 4+
- ✅ Next.js
- ✅ Nuxt.js

### 样式方案
- ✅ CSS Modules
- ✅ Styled Components
- ✅ Emotion
- ✅ Tailwind CSS
- ✅ SCSS/SASS

### 构建工具
- ✅ Vite
- ✅ Webpack
- ✅ Rollup
- ✅ esbuild

### 测试框架
- ✅ Jest
- ✅ Vitest
- ✅ React Testing Library
- ✅ Vue Test Utils

## 🔧 高级功能

### 组件模板自定义

创建 `.templates/` 目录：
```
.templates/
├── react-component.tsx
├── vue-component.vue
└── svelte-component.svelte
```

### 性能监控集成

```javascript
// 集成 Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // 发送到分析服务
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🐛 故障排查

### 问题：组件生成失败

**解决方案**：
```bash
# 检查 package.json
cat package.json | grep react

# 确保依赖已安装
npm install
```

### 问题：样式不生效

**解决方案**：
```bash
# 检查样式配置
/style config

# 重新构建
npm run build
```

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../docs/contributing.md)

## 📄 许可证

MIT License

---

**Happy coding with Web-Dev!** 💻✨

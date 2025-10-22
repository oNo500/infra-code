---
description: 创建前端组件（React/Vue/Svelte）
---

# 创建组件

帮助用户快速创建前端组件，支持 React、Vue、Svelte 等主流框架，自动生成组件文件、样式文件和测试文件。

## 参数
- 组件名称：$ARGUMENTS 的第一个参数
- 框架类型：$ARGUMENTS 的第二个参数（react/vue/svelte，可选）
- 组件类型：$ARGUMENTS 的第三个参数（functional/class/sfc，可选）

## 创建步骤

1. **确定组件信息**：
   - 组件名称（必需）
   - 使用的框架（React/Vue/Svelte）
   - 组件类型（函数组件/类组件/SFC）
   - 是否需要 TypeScript
   - 是否需要样式文件
   - 是否需要测试文件

2. **检测项目配置**：
   - 读取 package.json 识别使用的框架
   - 检测是否使用 TypeScript
   - 识别样式方案（CSS Modules/Styled Components/Tailwind等）
   - 确定测试框架（Jest/Vitest）

3. **生成组件文件**：

### React 组件示例

**TypeScript + 函数组件**：
```typescript
import React from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  // Props 定义
}

export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  return (
    <div className={styles.container}>
      <h1>ComponentName</h1>
    </div>
  );
};
```

**JavaScript + Hooks**：
```javascript
import { useState } from 'react';
import './ComponentName.css';

export function ComponentName() {
  const [state, setState] = useState(null);

  return (
    <div className="component-name">
      <h1>ComponentName</h1>
    </div>
  );
}
```

### Vue 组件示例

**Vue 3 Composition API**：
```vue
<template>
  <div class="component-name">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'ComponentName'
});
</script>

<style scoped>
.component-name {
  /* 样式 */
}
</style>
```

### Svelte 组件示例

```svelte
<script lang="ts">
  export let title: string = 'ComponentName';
</script>

<div class="component-name">
  <h1>{title}</h1>
</div>

<style>
  .component-name {
    /* 样式 */
  }
</style>
```

4. **生成样式文件**：

根据项目配置选择：
- CSS Modules: `ComponentName.module.css`
- Styled Components: 内联在组件文件中
- Tailwind: 不生成单独样式文件
- SCSS: `ComponentName.module.scss`

5. **生成测试文件**：

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('ComponentName')).toBeInTheDocument();
  });
});
```

6. **更新导出索引**：

在 `index.ts` 或 `index.js` 中添加：
```typescript
export { ComponentName } from './ComponentName';
```

7. **生成 Storybook 文件**（可选）：

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
  title: 'Components/ComponentName',
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {},
};
```

## 组件类型

### 展示组件（Presentational）
- 只负责 UI 渲染
- 通过 props 接收数据
- 无状态或只有 UI 状态

### 容器组件（Container）
- 负责数据获取和业务逻辑
- 可以包含其他组件
- 管理状态

### 高阶组件（HOC）
- 接收组件返回增强的组件
- 用于代码复用和逻辑抽象

## 最佳实践

1. **命名规范**：
   - 使用 PascalCase：`UserProfile`
   - 文件名与组件名一致
   - 目录按功能组织

2. **Props 设计**：
   - 明确的 TypeScript 接口
   - 提供默认值
   - 使用 optional chaining

3. **样式组织**：
   - 使用 CSS Modules 避免全局污染
   - BEM 命名规范
   - 响应式设计

4. **性能优化**：
   - 使用 React.memo 避免不必要渲染
   - 合理拆分组件
   - 懒加载大型组件

## 示例用法

```bash
# 基本用法
/component UserProfile

# 指定框架
/component UserCard react

# TypeScript + 测试
/component Button react functional

# Vue 组件
/component HeaderNav vue

# 带样式和测试
/component ProductCard react --with-test --with-styles
```

## 注意事项
- 确保在正确的目录下创建组件
- 检查组件名是否已存在
- 遵循项目的代码规范
- 生成后建议运行 ESLint 和 Prettier

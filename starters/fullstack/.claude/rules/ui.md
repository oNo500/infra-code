---
paths:
  - packages/ui/**
---

# packages/ui — Architecture Rules

## Tech Stack

| 类别 | 技术 |
|------|------|
| 框架 | React 19 |
| 组件系统 | shadcn (base-ui + radix-ui) |
| 动画 | motion |
| 通知 | sonner |
| 抽屉 | vaul |
| 样式 | Tailwind CSS v4, tailwind-merge, class-variance-authority |
| 主题 | next-themes |
| 类型校验 | Zod |

## Architecture

```
src/
├── components/             # UI 组件
│   ├── <name>.tsx          # 单文件组件（简单组件）
│   └── kibo-ui/            # kibo-ui 扩展组件
│       └── <name>/
│           └── index.tsx
├── hooks/                  # 共享 hooks
├── lib/
│   └── utils.ts            # cn() 等工具函数
└── styles/
    └── globals.css         # 全局 CSS 变量 + Tailwind 基础样式
```

## 组件管理规范

- 组件 MUST 通过 shadcn CLI 安装：`pnpm dlx shadcn@latest add <component>`
- 禁止手动新建或修改 shadcn 管理的组件文件（`button.tsx`、`input.tsx` 等）
- 新增非 shadcn 组件放在 `src/components/` 下，复杂组件用子目录 + `index.tsx`

## Exports

所有导出通过 `package.json` exports 字段定义：
- 组件：`@workspace/ui/components/<name>`
- Hooks：`@workspace/ui/hooks/<name>`
- Lib：`@workspace/ui/lib/<name>`
- 样式：`@workspace/ui/globals.css`

消费方直接按路径导入，禁止使用 barrel 文件（`index.ts`）聚合。

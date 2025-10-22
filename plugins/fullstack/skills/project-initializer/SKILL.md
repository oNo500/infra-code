---
name: project-initializer
description: 快速初始化全栈项目结构和配置
version: 0.1.0
---

# Project Initializer Skill

自动初始化全栈项目的目录结构、配置文件和基础代码。

## 功能

- 创建 Monorepo 结构
- 生成配置文件
- 初始化前端和后端项目
- 配置共享包
- 设置开发环境

## 参数

```json
{
  "project_name": "string",
  "structure": "monorepo | separate",
  "frontend": {
    "framework": "react | vue | svelte",
    "typescript": true,
    "ssr": true | false
  },
  "backend": {
    "framework": "express | fastify | nestjs",
    "database": "postgresql | mysql | mongodb",
    "orm": "prisma | typeorm | mongoose"
  },
  "features": {
    "auth": true | false,
    "docker": true | false,
    "ci_cd": true | false
  }
}
```

## 使用示例

### 基础用法

```typescript
import { skillInvoke } from '@claude/skills';

const result = await skillInvoke('project-initializer', {
  project_name: 'my-saas',
  structure: 'monorepo',
  frontend: {
    framework: 'react',
    typescript: true,
    ssr: true
  },
  backend: {
    framework: 'nestjs',
    database: 'postgresql',
    orm: 'prisma'
  },
  features: {
    auth: true,
    docker: true,
    ci_cd: true
  }
});
```

## 生成的项目结构

### Monorepo 结构

```
my-saas/
├── apps/
│   ├── web/                    # 前端应用
│   │   ├── src/
│   │   │   ├── app/            # App Router
│   │   │   ├── components/     # 组件
│   │   │   ├── hooks/          # 自定义 Hooks
│   │   │   ├── lib/            # 工具函数
│   │   │   └── styles/         # 样式
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   │
│   └── api/                    # 后端 API
│       ├── src/
│       │   ├── modules/        # 功能模块
│       │   ├── common/         # 通用代码
│       │   ├── config/         # 配置
│       │   └── main.ts         # 入口
│       ├── prisma/
│       │   └── schema.prisma
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/                  # 共享类型
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── product.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                 # 共享配置
│   │   ├── eslint-config/
│   │   ├── typescript-config/
│   │   └── prettier-config/
│   │
│   ├── ui/                     # 共享 UI 组件
│   │   ├── src/
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── utils/                  # 共享工具
│       ├── src/
│       │   ├── date.ts
│       │   ├── string.ts
│       │   └── index.ts
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docker/
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 生成的配置文件

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### 根 package.json

```json
{
  "name": "my-saas",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

### 前端 package.json

```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "@my-saas/types": "workspace:*",
    "@my-saas/ui": "workspace:*",
    "@my-saas/utils": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### 后端 package.json

```json
{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@my-saas/types": "workspace:*",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 初始化流程

### 1. 验证参数
```typescript
function validateParams(params: ProjectParams): void {
  if (!params.project_name) {
    throw new Error('Project name is required');
  }
  if (!/^[a-z0-9-]+$/.test(params.project_name)) {
    throw new Error('Project name must be lowercase and use hyphens');
  }
}
```

### 2. 创建目录结构
```typescript
async function createDirectoryStructure(projectPath: string): Promise<void> {
  const dirs = [
    'apps/web/src',
    'apps/api/src',
    'packages/types/src',
    'packages/config',
    'packages/ui/src',
    'packages/utils/src',
    '.github/workflows',
    'docker'
  ];

  for (const dir of dirs) {
    await mkdir(path.join(projectPath, dir), { recursive: true });
  }
}
```

### 3. 生成配置文件
```typescript
async function generateConfigFiles(projectPath: string, params: ProjectParams): Promise<void> {
  const configs = {
    'package.json': generateRootPackageJson(params),
    'pnpm-workspace.yaml': generateWorkspaceConfig(),
    'turbo.json': generateTurboConfig(),
    '.gitignore': generateGitignore(),
    '.env.example': generateEnvExample(params),
    'tsconfig.json': generateRootTsConfig()
  };

  for (const [filename, content] of Object.entries(configs)) {
    await writeFile(
      path.join(projectPath, filename),
      typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    );
  }
}
```

### 4. 初始化应用
```typescript
async function initializeApps(projectPath: string, params: ProjectParams): Promise<void> {
  // 初始化前端
  if (params.frontend.framework === 'react') {
    await initNextApp(path.join(projectPath, 'apps/web'), params);
  }

  // 初始化后端
  if (params.backend.framework === 'nestjs') {
    await initNestApp(path.join(projectPath, 'apps/api'), params);
  }
}
```

### 5. 配置共享包
```typescript
async function setupSharedPackages(projectPath: string): Promise<void> {
  const packages = ['types', 'config', 'ui', 'utils'];

  for (const pkg of packages) {
    await generatePackage(path.join(projectPath, 'packages', pkg));
  }
}
```

### 6. 安装依赖
```typescript
async function installDependencies(projectPath: string): Promise<void> {
  await execCommand('pnpm install', { cwd: projectPath });
}
```

## 返回值

```typescript
interface InitializationResult {
  success: boolean;
  project_path: string;
  structure: {
    apps: string[];
    packages: string[];
  };
  next_steps: string[];
}
```

### 成功示例

```json
{
  "success": true,
  "project_path": "/path/to/my-saas",
  "structure": {
    "apps": ["web", "api"],
    "packages": ["types", "config", "ui", "utils"]
  },
  "next_steps": [
    "cd my-saas",
    "cp .env.example .env",
    "Edit .env with your configuration",
    "pnpm dev"
  ]
}
```

## 错误处理

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROJECT_NAME",
    "message": "Project name must be lowercase and use hyphens"
  }
}
```

## 最佳实践

1. **项目命名**：使用小写和连字符
2. **TypeScript**：默认启用 TypeScript
3. **Monorepo**：推荐使用 pnpm workspace
4. **共享代码**：将通用代码放在 packages/
5. **环境变量**：提供 .env.example 模板
6. **Git**：初始化 git 并配置 .gitignore
7. **CI/CD**：生成基础的 GitHub Actions 配置

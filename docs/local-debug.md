# 本地调试包

## 方案一：workspace 协议（monorepo 内部）

适用于使用方也在同一 monorepo 中的情况，pnpm install 会自动创建软链接。

```json
{
  "devDependencies": {
    "@your-scope/eslint-config": "workspace:*"
  }
}
```

## 方案二：直接路径链接（跨项目）

适用于在外部项目中调试本地包。

```bash
# 链接
pnpm link /Users/xiu/code/infra-code/packages/eslint-config

# 调试完成后取消
pnpm unlink /Users/xiu/code/infra-code/packages/eslint-config
```

## 方案三：全局链接

```bash
# 在包目录下注册到全局
cd packages/eslint-config
pnpm link --global

# 在使用方项目中引用
cd /path/to/your-project
pnpm link --global @your-scope/eslint-config

# 调试完成后取消
pnpm unlink --global @your-scope/eslint-config
```

import { defineConfig } from 'taze'

export default defineConfig({
  // 不排除任何包
  exclude: [],

  // 强制拉取最新版本信息
  force: true,

  // 直接写入 package.json
  write: true,

  // 升级完成后立即安装
  install: true,

  // 所有依赖默认升级到 latest
  packageMode: {
    '/.*/': 'latest',
  },

  // 同时处理 overrides / resolutions
  depFields: {
    dependencies: true,
    devDependencies: true,
    peerDependencies: true,
    optionalDependencies: true,
    overrides: true,
    resolutions: true,
  },

  // 在 monorepo 中扫描所有 workspace
  ignoreOtherWorkspaces: false,
})
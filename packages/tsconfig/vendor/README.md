# 预设开发快照

此目录带内容摘要的 `.tgz` 由相邻 `presets/packages/tsconfig-presets` 打包生成，是尚未发布预设的固定开发依赖。保存此快照后，单独检出 `infra-code` 可完成依赖安装和构建；生成器发布产物不包含此开发依赖。

配置内容以 `presets` 为维护来源，不手工修改 tarball。预设更新后，从 `infra-code` 根目录重新同步：

```sh
bun run --cwd ../presets/packages/tsconfig-presets build
npm pack ../presets/packages/tsconfig-presets --ignore-scripts --pack-destination packages/tsconfig/vendor
shasum -a 256 packages/tsconfig/vendor/infra-x-tsconfig-presets-0.0.0.tgz
```

将新包重命名为 `infra-x-tsconfig-presets-0.0.0-<摘要前12位>.tgz`，并将 `packages/tsconfig/package.json` 的对应开发依赖改为 `file:./vendor/<新文件名>`。内容变化时必须使用新文件名：本机 Bun 1.4.2 实测，覆盖同名 tarball 后普通安装和 `--force` 都会继续使用旧缓存及锁文件。

再安装并构建：

```sh
bun install
bun run --cwd packages/tsconfig build
```

将新快照、manifest 与 `bun.lock` 一起保存。预设正式发布后，开发依赖可改为实际 registry 版本，并移除这个发布前快照。

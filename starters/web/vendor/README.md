# 预设开发快照

本目录保存 `~/code/presets` 中尚未发布的 Oxlint、Oxfmt 预设打包产物。依赖使用本目录的 `file:` 路径，单独下载本项目即可安装，无需相邻仓库。源码在独立的 `presets` 仓库维护，不手工编辑 tarball。

更新时先在 `presets` 构建对应包，再通过 `npm pack --ignore-scripts` 打包。文件名包含 SHA-256 的前 12 位；同步替换 tarball、`package.json` 路径和本项目锁文件。正式发布后再改用已发布版本。

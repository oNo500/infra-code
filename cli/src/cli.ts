#!/usr/bin/env node

import cac from 'cac'
import { listCommand } from './commands/list.js'
import { installCommand } from './commands/install.js'
import { check } from './commands/check.js'

// 版本信息
const VERSION = '2.0.0'

// 创建 CLI 实例
const cli = cac('claude-conf')

// 默认命令（检查配置）
cli
  .command('[...args]', '检查配置状态')
  .action(async () => {
    await check()
  })

// 安装命令
cli
  .command('install [template]', '安装 Claude Settings 模板')
  .option('--scope <scope>', 'Scope: user/project/local')
  .option('--strategy <strategy>', '合并策略: merge/replace')
  .action(async (templateName?: string, options?: { scope?: string, strategy?: string }) => {
    await installCommand(templateName, options)
  })

// 列表命令
cli
  .command('list', '列出可用模板')
  .action(async () => {
    await listCommand()
  })

// 检查命令（显式）
cli
  .command('check', '检查配置状态')
  .action(async () => {
    await check()
  })

// 帮助和版本
cli.help()
cli.version(VERSION)

// 解析命令行参数
try {
  cli.parse()
}
catch (error) {
  console.error('执行命令时发生错误:', error)
  process.exit(1)
}

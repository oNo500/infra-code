#!/usr/bin/env node

import { listCommand } from './commands/list.js'
import { previewCommand } from './commands/preview.js'
import { installCommand } from './commands/install.js'
import type { Scope } from './types/index.js'

// 版本信息
const VERSION = '0.1.0'

// 解析命令行参数
const args = process.argv.slice(2)
const command = args[0]

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
Claude Conf v${VERSION} - Claude Code Settings 模版安装器

用法:
  claude-conf <command> [options]

命令:
  install              交互式安装 Claude Settings 模版
  list [options]       列出可用的 Claude Settings 模版
  preview <name>       预览模版内容

选项:
  list 命令:
    -s, --scope <scope>       指定 scope (user/project/local)

  preview 命令:
    -s, --scope <scope>       模版 scope (user/project/local) [必需]

示例:
  $ claude-conf install
  $ claude-conf list
  $ claude-conf list --scope user
  $ claude-conf preview basic --scope user

更多信息请访问: https://github.com/...
`)
}

/**
 * 显示版本信息
 */
function showVersion(): void {
  console.log(`Claude Conf v${VERSION}`)
}

/**
 * 解析选项参数
 */
function parseOption(args: string[], option: string): string | undefined {
  const shortFlag = `-${option.charAt(0)}`
  const longFlag = `--${option}`

  const index = args.findIndex(arg => arg === shortFlag || arg === longFlag)
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]
  }

  return undefined
}

/**
 * 验证 scope
 */
function validateScope(scope: string): scope is Scope {
  return ['user', 'project', 'local'].includes(scope)
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  // 处理帮助和版本
  if (!command || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  if (command === '--version' || command === '-v') {
    showVersion()
    return
  }

  // 处理命令
  try {
    switch (command) {
      case 'install': {
        await installCommand()
        break
      }

      case 'list': {
        const scope = parseOption(args, 'scope')

        if (scope && !validateScope(scope)) {
          console.error(`错误: 无效的 scope "${scope}"，必须是 user, project 或 local`)
          process.exit(1)
        }

        await listCommand(scope as Scope | undefined)
        break
      }

      case 'preview': {
        const name = args[1]
        const scope = parseOption(args, 'scope')

        if (!name) {
          console.error('错误: 缺少模版名称')
          console.log('用法: claude-conf preview <name> --scope <scope>')
          process.exit(1)
        }

        if (!scope) {
          console.error('错误: 缺少 --scope 参数')
          console.log('用法: claude-conf preview <name> --scope <scope>')
          process.exit(1)
        }

        if (!validateScope(scope)) {
          console.error(`错误: 无效的 scope "${scope}"，必须是 user, project 或 local`)
          process.exit(1)
        }

        await previewCommand(name, scope as Scope)
        break
      }

      default: {
        console.error(`错误: 未知命令 "${command}"`)
        console.log('运行 "claude-conf --help" 查看可用命令')
        process.exit(1)
      }
    }
  }
  catch (error) {
    console.error('执行命令时发生错误:', error)
    process.exit(1)
  }
}

// 运行主函数
main().catch((error) => {
  console.error('未捕获的错误:', error)
  process.exit(1)
})

import * as clack from '@clack/prompts'
import type { Scope } from '../types/index.js'
import { formatTemplateList, loadAllLocalTemplates, loadTemplatesByScope } from '../core/template.js'

/**
 * 列出可用模版
 * @param scope 指定 scope（可选）
 */
export async function listCommand(scope?: Scope): Promise<void> {
  clack.intro('📋 Claude Settings 模版列表')

  try {
    if (scope) {
      // 列出特定 scope 的模版
      const templates = await loadTemplatesByScope(scope)

      if (templates.length === 0) {
        clack.log.warn(`暂无 ${scope} scope 的模版`)
        return
      }

      clack.log.info(`\n${scope.toUpperCase()} Scope 模版:\n`)
      console.log(formatTemplateList(templates))
    }
    else {
      // 列出所有模版
      const templatesMap = await loadAllLocalTemplates()

      let hasTemplates = false

      for (const [s, templates] of templatesMap.entries()) {
        if (templates.length > 0) {
          hasTemplates = true
          clack.log.info(`\n${s.toUpperCase()} Scope 模版:\n`)
          console.log(formatTemplateList(templates))
          console.log()
        }
      }

      if (!hasTemplates) {
        clack.log.warn('暂无可用模版')
      }
    }

    clack.outro('✓ 完成')
  }
  catch (error) {
    clack.log.error('加载模版失败')
    console.error(error)
    process.exit(1)
  }
}

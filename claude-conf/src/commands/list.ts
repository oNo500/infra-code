import * as clack from '@clack/prompts'
import { formatTemplateList, loadAllTemplates } from '../utils.js'

/**
 * 列出可用模板
 */
export async function listCommand(): Promise<void> {
  clack.intro('📋 Claude Settings 模版列表')

  try {
    const templates = await loadAllTemplates()

    if (templates.length === 0) {
      clack.log.warn('暂无可用模板')
      clack.outro('✓ 完成')
      return
    }

    console.log('\n可用模版:\n')
    console.log(formatTemplateList(templates))
    console.log()

    clack.outro('✓ 完成')
  }
  catch (error) {
    clack.log.error('加载模板失败')
    console.error(error)
    process.exit(1)
  }
}

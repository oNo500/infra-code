import * as clack from '@clack/prompts'
import type { MergeStrategy, Scope, Template, TemplateSource } from '../types/index.js'
import { CliError } from '../types/index.js'
import {
  findTemplateByName,
  formatTemplateList,
  getTemplateConfigSummary,
  getTemplateInfo,
  loadTemplatesByScope,
} from '../core/template.js'
import {
  downloadGitTemplate,
  downloadNpmTemplate,
  isGitAvailable,
  isNpmAvailable,
  parseGitUrl,
  validateGitUrl,
  validateNpmPackageName,
} from '../core/remote.js'
import { formatConfigInfo, getConfigInfo, installConfig, previewConfigChanges } from '../core/config.js'

/**
 * 交互式安装模版
 */
export async function installCommand(): Promise<void> {
  clack.intro('📦 Claude Settings 模版安装器')

  try {
    // 1. 选择 scope
    const scope = await selectScope()
    if (clack.isCancel(scope)) {
      clack.cancel('操作已取消')
      process.exit(0)
    }

    // 2. 选择模版来源
    const sourceType = await selectSourceType()
    if (clack.isCancel(sourceType)) {
      clack.cancel('操作已取消')
      process.exit(0)
    }

    // 3. 获取模版
    const template = await getTemplate(sourceType as string, scope as Scope)
    if (!template) {
      clack.outro('✗ 操作取消')
      process.exit(0)
    }

    // 4. 预览模版
    displayTemplateInfo(template)

    // 5. 选择合并策略
    const strategy = await selectMergeStrategy(scope as Scope)
    if (clack.isCancel(strategy)) {
      clack.cancel('操作已取消')
      process.exit(0)
    }

    // 6. 预览配置变更
    await previewChanges(scope as Scope, template, strategy as MergeStrategy)

    // 7. 确认安装
    const confirm = await clack.confirm({
      message: '确认安装此配置？',
      initialValue: false,
    })

    if (clack.isCancel(confirm) || !confirm) {
      clack.cancel('安装已取消')
      process.exit(0)
    }

    // 8. 执行安装
    const spinner = clack.spinner()
    spinner.start('正在安装配置...')

    const result = await installConfig(
      scope as Scope,
      template.config,
      strategy as MergeStrategy,
      true, // 启用备份
    )

    spinner.stop('配置安装成功！')

    // 显示结果
    clack.log.success(`\n✓ 配置已安装到: ${result.configPath}`)

    if (result.backupPath) {
      clack.log.info(`📦 原配置已备份到: ${result.backupPath}`)
    }

    clack.outro('✓ 完成！')
  }
  catch (error) {
    clack.log.error('安装失败')
    if (error instanceof CliError) {
      console.error(`错误: ${error.message}`)
    }
    else {
      console.error(error)
    }
    process.exit(1)
  }
}

/**
 * 选择配置范围
 */
async function selectScope() {
  return await clack.select({
    message: '选择配置范围 (Scope)',
    options: [
      { value: 'user', label: 'User    (~/.claude/settings.json)', hint: '用户级全局配置' },
      { value: 'project', label: 'Project ({cwd}/.claude/settings.json)', hint: '项目级配置' },
      { value: 'local', label: 'Local   ({cwd}/.claude/settings.local.json)', hint: '本地配置（不提交）' },
    ],
  })
}

/**
 * 选择模版来源类型
 */
async function selectSourceType() {
  return await clack.select({
    message: '选择模版来源',
    options: [
      { value: 'local', label: '本地模版库', hint: '使用预定义的模版' },
      { value: 'git', label: '远程 Git 仓库', hint: '从 GitHub 等下载' },
      { value: 'npm', label: 'NPM 包', hint: '从 NPM 安装模版包' },
    ],
  })
}

/**
 * 获取模版
 */
async function getTemplate(
  sourceType: string,
  scope: Scope,
): Promise<Template | null> {
  switch (sourceType) {
    case 'local':
      return await selectLocalTemplate(scope)
    case 'git':
      return await downloadFromGit()
    case 'npm':
      return await downloadFromNpm()
    default:
      throw new CliError('未知的模版来源类型', 'UNKNOWN_SOURCE_TYPE')
  }
}

/**
 * 从本地选择模版
 */
async function selectLocalTemplate(scope: Scope): Promise<Template | null> {
  const templates = await loadTemplatesByScope(scope)

  if (templates.length === 0) {
    clack.log.warn(`暂无 ${scope} scope 的本地模版`)
    return null
  }

  const templateName = await clack.select({
    message: '选择模版',
    options: templates.map(t => ({
      value: t.metadata.name,
      label: t.metadata.name,
      hint: t.metadata.description,
    })),
  })

  if (clack.isCancel(templateName)) {
    return null
  }

  return await findTemplateByName(templateName as string, scope)
}

/**
 * 从 Git 下载模版
 */
async function downloadFromGit(): Promise<Template | null> {
  // 检查 Git 是否可用
  const gitAvailable = await isGitAvailable()
  if (!gitAvailable) {
    clack.log.error('Git 不可用，请先安装 Git')
    return null
  }

  const url = await clack.text({
    message: '输入 Git 仓库 URL',
    placeholder: 'https://github.com/user/repo',
    validate: (value) => {
      if (!value) {
        return '请输入 URL'
      }
      if (!validateGitUrl(value)) {
        return 'URL 格式无效'
      }
    },
  })

  if (clack.isCancel(url)) {
    return null
  }

  const spinner = clack.spinner()
  spinner.start('正在从 Git 下载模版...')

  try {
    const parsed = parseGitUrl(url as string)
    const template = await downloadGitTemplate({
      type: 'git',
      url: parsed.url,
      ref: parsed.ref,
      path: parsed.path,
    })

    spinner.stop('模版下载成功！')
    return template
  }
  catch (error) {
    spinner.stop('下载失败')
    throw error
  }
}

/**
 * 从 NPM 下载模版
 */
async function downloadFromNpm(): Promise<Template | null> {
  // 检查 NPM 是否可用
  const npmAvailable = await isNpmAvailable()
  if (!npmAvailable) {
    clack.log.error('NPM 不可用，请先安装 Node.js 和 NPM')
    return null
  }

  const packageName = await clack.text({
    message: '输入 NPM 包名',
    placeholder: '@scope/package-name 或 package-name',
    validate: (value) => {
      if (!value) {
        return '请输入包名'
      }
      if (!validateNpmPackageName(value)) {
        return '包名格式无效'
      }
    },
  })

  if (clack.isCancel(packageName)) {
    return null
  }

  const spinner = clack.spinner()
  spinner.start('正在从 NPM 下载模版...')

  try {
    const template = await downloadNpmTemplate({
      type: 'npm',
      packageName: packageName as string,
    })

    spinner.stop('模版下载成功！')
    return template
  }
  catch (error) {
    spinner.stop('下载失败')
    throw error
  }
}

/**
 * 选择合并策略
 */
async function selectMergeStrategy(scope: Scope): Promise<MergeStrategy | symbol> {
  // 检查是否已存在配置
  const configInfo = await getConfigInfo(scope)

  if (!configInfo.exists) {
    // 如果不存在配置，直接使用 replace 策略
    return 'replace'
  }

  // 如果存在配置，让用户选择
  return await clack.select({
    message: '检测到已有配置，选择合并策略',
    options: [
      { value: 'merge', label: '合并配置', hint: '保留现有配置，添加新配置项' },
      { value: 'replace', label: '替换配置', hint: '完全覆盖现有配置' },
    ],
  })
}

/**
 * 预览配置变更
 */
async function previewChanges(
  scope: Scope,
  template: Template,
  strategy: MergeStrategy,
): Promise<void> {
  const preview = await previewConfigChanges(scope, template.config, strategy)

  clack.log.info('\n📋 配置预览:\n')

  if (preview.isNew) {
    clack.log.success('这是一个新配置文件')
  }
  else {
    clack.log.warn('将更新现有配置文件')
  }

  clack.log.info('\n最终配置将包含:\n')
  const configInfo = formatConfigInfo(preview.final, 1)
  configInfo.forEach(line => console.log(line))
}

/**
 * 显示模版信息
 */
function displayTemplateInfo(template: Template): void {
  clack.log.info('\n📦 模版信息:\n')
  console.log(`  ${getTemplateInfo(template)}`)

  const summary = getTemplateConfigSummary(template)
  if (summary.length > 0) {
    console.log('\n  配置项:')
    summary.forEach(item => console.log(`  ${item}`))
  }
}

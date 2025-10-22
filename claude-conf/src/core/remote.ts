import { execa } from 'execa'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import fs from 'fs-extra'
import type { GitTemplateSource, NpmTemplateSource, Template } from '../types/index.js'
import { CliError } from '../types/index.js'
import { loadTemplateFromFile, validateTemplate } from './template.js'
import { fileExists } from '../utils/fs.js'

/**
 * 生成临时目录名
 */
function generateTempDirName(): string {
  const random = randomBytes(8).toString('hex')
  return join(tmpdir(), `claude-conf-${random}`)
}

/**
 * 清理临时目录
 * @param tempDir 临时目录路径
 */
async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fs.remove(tempDir)
  }
  catch (error) {
    console.warn(`警告: 清理临时目录失败: ${tempDir}`, error)
  }
}

/**
 * 从 Git 仓库下载模版
 * @param source Git 模版来源
 */
export async function downloadGitTemplate(
  source: GitTemplateSource,
): Promise<Template> {
  const tempDir = generateTempDirName()

  try {
    // 克隆仓库
    const args = ['clone', '--depth', '1']

    if (source.ref) {
      args.push('--branch', source.ref)
    }

    args.push(source.url, tempDir)

    await execa('git', args)

    // 读取模版文件
    const templatePath = source.path
      ? join(tempDir, source.path, 'template.json')
      : join(tempDir, 'template.json')

    const exists = await fileExists(templatePath)
    if (!exists) {
      throw new CliError(
        `模版文件不存在: ${templatePath}`,
        'TEMPLATE_NOT_FOUND',
      )
    }

    const template = await loadTemplateFromFile(templatePath)

    // 验证模版
    validateTemplate(template)

    return template
  }
  catch (error) {
    if (error instanceof CliError) {
      throw error
    }
    throw new CliError(
      `从 Git 下载模版失败: ${source.url}`,
      'GIT_DOWNLOAD_ERROR',
      error,
    )
  }
  finally {
    // 清理临时目录
    await cleanupTempDir(tempDir)
  }
}

/**
 * 从 NPM 下载模版
 * @param source NPM 模版来源
 */
export async function downloadNpmTemplate(
  source: NpmTemplateSource,
): Promise<Template> {
  const tempDir = generateTempDirName()

  try {
    // 安装 NPM 包到临时目录
    await fs.ensureDir(tempDir)

    const packageSpec = source.version
      ? `${source.packageName}@${source.version}`
      : source.packageName

    await execa('npm', ['install', '--no-save', '--prefix', tempDir, packageSpec])

    // 读取模版文件
    const templatePath = join(
      tempDir,
      'node_modules',
      source.packageName,
      'template.json',
    )

    const exists = await fileExists(templatePath)
    if (!exists) {
      throw new CliError(
        `模版文件不存在: ${templatePath}`,
        'TEMPLATE_NOT_FOUND',
      )
    }

    const template = await loadTemplateFromFile(templatePath)

    // 验证模版
    validateTemplate(template)

    return template
  }
  catch (error) {
    if (error instanceof CliError) {
      throw error
    }
    throw new CliError(
      `从 NPM 下载模版失败: ${source.packageName}`,
      'NPM_DOWNLOAD_ERROR',
      error,
    )
  }
  finally {
    // 清理临时目录
    await cleanupTempDir(tempDir)
  }
}

/**
 * 检查 Git 是否可用
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    await execa('git', ['--version'])
    return true
  }
  catch {
    return false
  }
}

/**
 * 检查 NPM 是否可用
 */
export async function isNpmAvailable(): Promise<boolean> {
  try {
    await execa('npm', ['--version'])
    return true
  }
  catch {
    return false
  }
}

/**
 * 验证 Git URL 格式
 * @param url Git URL
 */
export function validateGitUrl(url: string): boolean {
  // 支持 https 和 git 协议
  const gitUrlPattern = /^(https?:\/\/|git@|git:\/\/)/
  return gitUrlPattern.test(url)
}

/**
 * 验证 NPM 包名格式
 * @param packageName NPM 包名
 */
export function validateNpmPackageName(packageName: string): boolean {
  // NPM 包名规则：可以包含 scope，如 @scope/package
  const npmPackagePattern = /^(@[\da-z~-][\d._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/
  return npmPackagePattern.test(packageName)
}

/**
 * 解析 Git URL 获取仓库信息
 * @param url Git URL
 */
export function parseGitUrl(url: string): {
  url: string
  ref?: string
  path?: string
} {
  // 简单解析，支持格式：
  // - https://github.com/user/repo
  // - https://github.com/user/repo#branch
  // - https://github.com/user/repo#branch:path/to/template

  const parts = url.split('#')
  const baseUrl = parts[0]

  if (parts.length === 1) {
    return { url: baseUrl }
  }

  const refAndPath = parts[1].split(':')
  const ref = refAndPath[0]
  const path = refAndPath[1]

  return {
    url: baseUrl,
    ref: ref || undefined,
    path: path || undefined,
  }
}

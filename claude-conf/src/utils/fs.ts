import fs from 'fs-extra'
import { dirname } from 'node:path'
import type { ClaudeSettings } from '../types/index.js'
import { CliError } from '../types/index.js'

/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  }
  catch (error) {
    throw new CliError(
      `读取文件失败: ${filePath}`,
      'READ_FILE_ERROR',
      error,
    )
  }
}

/**
 * 写入 JSON 文件
 * @param filePath 文件路径
 * @param data 数据
 * @param pretty 是否格式化（默认 true）
 */
export async function writeJsonFile(
  filePath: string,
  data: unknown,
  pretty: boolean = true,
): Promise<void> {
  try {
    // 确保目录存在
    await fs.ensureDir(dirname(filePath))

    const content = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data)

    await fs.writeFile(filePath, content + '\n', 'utf-8')
  }
  catch (error) {
    throw new CliError(
      `写入文件失败: ${filePath}`,
      'WRITE_FILE_ERROR',
      error,
    )
  }
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  }
  catch {
    return false
  }
}

/**
 * 复制文件
 * @param src 源文件路径
 * @param dest 目标文件路径
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  try {
    await fs.ensureDir(dirname(dest))
    await fs.copyFile(src, dest)
  }
  catch (error) {
    throw new CliError(
      `复制文件失败: ${src} -> ${dest}`,
      'COPY_FILE_ERROR',
      error,
    )
  }
}

/**
 * 列出目录下的所有文件
 * @param dirPath 目录路径
 * @param ext 文件扩展名过滤（可选，如 '.json'）
 */
export async function listFiles(
  dirPath: string,
  ext?: string,
): Promise<string[]> {
  try {
    const exists = await fileExists(dirPath)
    if (!exists) {
      return []
    }

    const files = await fs.readdir(dirPath)

    if (ext) {
      return files.filter(file => file.endsWith(ext))
    }

    return files
  }
  catch (error) {
    throw new CliError(
      `列出文件失败: ${dirPath}`,
      'LIST_FILES_ERROR',
      error,
    )
  }
}

/**
 * 确保目录存在
 * @param dirPath 目录路径
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath)
}

/**
 * 读取 Claude Settings 配置文件
 * @param filePath 文件路径
 */
export async function readClaudeSettings(
  filePath: string,
): Promise<ClaudeSettings> {
  return readJsonFile<ClaudeSettings>(filePath)
}

/**
 * 写入 Claude Settings 配置文件
 * @param filePath 文件路径
 * @param settings 配置内容
 */
export async function writeClaudeSettings(
  filePath: string,
  settings: ClaudeSettings,
): Promise<void> {
  await writeJsonFile(filePath, settings, true)
}

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        sourceValue
        && typeof sourceValue === 'object'
        && !Array.isArray(sourceValue)
        && targetValue
        && typeof targetValue === 'object'
        && !Array.isArray(targetValue)
      ) {
        // 递归合并对象
        result[key] = deepMerge(targetValue, sourceValue)
      }
      else {
        // 直接覆盖
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

/**
 * 创建文件备份
 * @param filePath 文件路径
 * @param backupPath 备份路径
 */
export async function createBackup(
  filePath: string,
  backupPath: string,
): Promise<void> {
  const exists = await fileExists(filePath)
  if (!exists) {
    throw new CliError(
      `文件不存在，无法备份: ${filePath}`,
      'FILE_NOT_FOUND',
    )
  }

  await copyFile(filePath, backupPath)
}

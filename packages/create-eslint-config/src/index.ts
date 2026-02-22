#!/usr/bin/env node

import { intro, outro, confirm, log } from '@clack/prompts'
import { cp, access, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

async function getConflicts(templateDir: string, destDir: string): Promise<string[]> {
  const entries = await readdir(templateDir, { recursive: true, withFileTypes: true })
  const conflicts: string[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    const rel = join(entry.parentPath ?? entry.path, entry.name).slice(templateDir.length + 1)
    const destPath = join(destDir, rel)
    try {
      await access(destPath)
      conflicts.push(rel)
    } catch {
      // file does not exist, no conflict
    }
  }

  return conflicts
}

async function main() {
  intro('@infra-x/create-eslint-config')

  const templateDir = join(fileURLToPath(new URL('.', import.meta.url)), 'template')
  const destDir = process.cwd()

  const conflicts = await getConflicts(templateDir, destDir)

  if (conflicts.length > 0) {
    log.warn(`以下文件已存在：\n${conflicts.map((f) => `  ${f}`).join('\n')}`)
    const ok = await confirm({ message: '是否覆盖这些文件？' })
    if (!ok) {
      outro('已取消')
      process.exit(0)
    }
  }

  await cp(templateDir, destDir, { recursive: true })
  outro('复制完成！')
}

main()

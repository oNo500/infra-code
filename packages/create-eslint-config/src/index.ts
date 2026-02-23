#!/usr/bin/env node

import { cp, access, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { intro, outro, confirm, log } from '@clack/prompts'

async function getConflicts(templateDir: string, destDir: string): Promise<string[]> {
  const entries = await readdir(templateDir, { recursive: true, withFileTypes: true })
  const conflicts: string[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    const rel = path.join(entry.parentPath, entry.name).slice(templateDir.length + 1)
    const destPath = path.join(destDir, rel)
    try {
      await access(destPath)
      conflicts.push(rel)
    } catch {
      // file does not exist, no conflict
    }
  }

  return conflicts
}

intro('@infra-x/create-eslint-config')

const templateDir = path.join(fileURLToPath(new URL('.', import.meta.url)), 'template')
const destDir = path.join(process.cwd(), 'eslint-config')

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

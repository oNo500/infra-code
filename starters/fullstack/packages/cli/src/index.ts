#!/usr/bin/env bun
import { defineCommand, runMain } from 'citty'

import { theme } from './commands/theme'

const main = defineCommand({
  meta: {
    name: 'ws-cli',
    description: 'Internal CLI tools for the monorepo',
  },
  subCommands: {
    theme,
  },
})

void runMain(main)

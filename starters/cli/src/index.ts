#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'

import { greet } from './commands/greet'

const main = defineCommand({
  meta: {
    name: 'mycli',
    version: '0.0.0',
    description: 'A Bun + citty CLI template',
  },
  args: {
    name: {
      type: 'string',
      description: 'Name to greet',
      default: 'world',
    },
    greeting: {
      type: 'string',
      description: 'Greeting prefix',
      default: 'Hello',
    },
  },
  run({ args }) {
    console.log(greet({ name: args.name, greeting: args.greeting }))
  },
})

void runMain(main)

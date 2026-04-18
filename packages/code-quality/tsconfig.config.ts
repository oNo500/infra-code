import { libNode } from '@infra-x/tsconfig'

import type { DefineTsconfigInput } from '@infra-x/tsconfig'

export default {
  profile: libNode(),
  include: ['src', '*.config.ts', '*.config.mts'],
} satisfies DefineTsconfigInput

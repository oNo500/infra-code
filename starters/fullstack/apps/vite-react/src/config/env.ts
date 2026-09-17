import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_NAME: z.string().trim().min(1).default('Vite React'),
    VITE_API_URL: z.url({ protocol: /^https?$/u }).optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})

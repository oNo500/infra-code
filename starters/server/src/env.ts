import { z } from 'zod'

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
})

export type Env = z.infer<typeof EnvSchema>

export function parseEnv(source: Record<string, string | undefined>): Env {
  return EnvSchema.parse(source)
}

export const env: Env = parseEnv(Bun.env as Record<string, string | undefined>)

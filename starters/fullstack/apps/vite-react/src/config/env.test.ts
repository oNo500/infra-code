import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_APP_NAME', '')
  vi.stubEnv('VITE_API_URL', '')
})

afterEach(() => vi.unstubAllEnvs())

describe('client environment', () => {
  it('starts without an API configuration and uses the default app name', async () => {
    const { env } = await import('./env')
    expect(env.VITE_APP_NAME).toBe('Vite React')
    expect(env.VITE_API_URL).toBeUndefined()
  })

  it('reads configured values from the Vite environment', async () => {
    vi.stubEnv('VITE_APP_NAME', 'My app')
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/v1')
    const { env } = await import('./env')
    expect(env.VITE_APP_NAME).toBe('My app')
    expect(env.VITE_API_URL).toBe('https://api.example.com/v1')
  })

  it.each(['/api', 'not-a-url', 'ftp://example.com'])(
    'rejects an invalid API URL: %s',
    async (url) => {
      vi.stubEnv('VITE_API_URL', url)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      await expect(import('./env')).rejects.toThrow('Invalid environment variables')
    },
  )
})

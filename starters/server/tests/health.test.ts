import { describe, expect, it } from 'bun:test'

import { health } from '@/routes/health'

interface HealthBody {
  status: string
  uptime: number
}

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await health.request('/health')
    expect(res.status).toBe(200)
    const body = (await res.json()) as HealthBody
    expect(body.status).toBe('ok')
    expect(typeof body.uptime).toBe('number')
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('VITE_APP_NAME', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('fetch client', () => {
  it('uses the current origin when no API URL is configured', async () => {
    vi.stubGlobal('fetch', async (request: Request) => Response.json({ url: request.url }))
    const { fetchClient } = await import('./fetch-client')
    const result = await fetchClient.get<{ url: string }>('/api/items')
    expect(result.error).toBeNull()
    expect(result.data?.url).toBe(`${window.location.origin}/api/items`)
  })

  it('preserves the API base path and serializes JSON writes without adding credentials', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/v1/')
    vi.stubGlobal('fetch', async (request: Request) =>
      Response.json({
        url: request.url,
        method: request.method,
        body: await request.json(),
        credentials: request.credentials,
      }),
    )
    const { fetchClient } = await import('./fetch-client')
    const result = await fetchClient.post('/items', { body: { title: 'Example' } })
    expect(result.error).toBeNull()
    expect(result.data).toEqual({
      url: 'https://api.example.com/v1/items',
      method: 'POST',
      body: { title: 'Example' },
      credentials: 'same-origin',
    })
  })

  it('gives concurrent GET requests independent retry budgets and stops after two retries', async () => {
    vi.useFakeTimers()
    const attempts = new Map([
      [`${window.location.origin}/one`, 0],
      [`${window.location.origin}/two`, 0],
    ])
    vi.stubGlobal('fetch', async (request: Request) => {
      const count = Number(attempts.get(request.url)) + 1
      attempts.set(request.url, count)
      return Response.json({ attempt: count }, { status: 503 })
    })
    const { fetchClient } = await import('./fetch-client')
    const pending = Promise.all([fetchClient.get('/one'), fetchClient.get('/two')])
    await vi.runAllTimersAsync()
    const results = await pending
    expect([...attempts.values()]).toEqual([3, 3])
    for (const result of results) {
      expect(result.error?.name).toBe('HTTPError')
      expect(result.response?.status).toBe(503)
    }
  })

  it.each([undefined, 2])('does not repeat a POST on 503 with retry=%s', async (retry) => {
    vi.useFakeTimers()
    let writes = 0
    vi.stubGlobal('fetch', async () => {
      writes += 1
      return Response.json({}, { status: 503 })
    })
    const { fetchClient } = await import('./fetch-client')
    const pending = fetchClient.post('/items', { body: { title: 'Example' }, retry })
    await vi.runAllTimersAsync()
    const result = await pending
    expect(result.error?.name).toBe('HTTPError')
    expect(writes).toBe(1)
  })

  it.each(['GET', 'POST'])('honors custom retry methods for %s requests', async (method) => {
    vi.useFakeTimers()
    let attempts = 0
    vi.stubGlobal('fetch', async () => {
      attempts += 1
      return Response.json({}, { status: 503 })
    })
    const { fetchClient } = await import('./fetch-client')
    const pending = fetchClient('/items', {
      method,
      retry: { limit: 2, methods: ['PUT'], statusCodes: [503] },
    })
    await vi.runAllTimersAsync()
    expect((await pending).error?.name).toBe('HTTPError')
    expect(attempts).toBe(1)
  })

  it('aborts a stalled request after 30 seconds and returns a timeout error', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      (request: Request) =>
        new Promise<Response>((_resolve, reject) => {
          request.signal.addEventListener('abort', () => reject(request.signal.reason), {
            once: true,
          })
        }),
    )
    const { fetchClient } = await import('./fetch-client')
    let completed = false
    const pending = fetchClient.get('/slow').then((result) => {
      completed = true
      return result
    })
    await vi.advanceTimersByTimeAsync(29_999)
    expect(completed).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect((await pending).error?.name).toBe('TimeoutError')
  })
})

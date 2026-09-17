import { createClient } from '@infra-x/fwrap'

import { env } from '@/config/env'

import type { RequestOptions } from '@infra-x/fwrap'

export type FetchClientOptions = Omit<RequestOptions, 'method'>

const retryMethods = ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE']
const defaultRetry = {
  limit: 2,
  methods: retryMethods,
  statusCodes: [408, 413, 429, 500, 502, 503, 504],
  retryOnTimeout: false,
}

function request<T = unknown>(input: string | URL, options: RequestOptions = {}) {
  const method = (options.method ?? 'GET').toUpperCase()
  const retry =
    typeof options.retry === 'number'
      ? { ...defaultRetry, limit: options.retry }
      : (options.retry ?? defaultRetry)

  // fwrap 0.1.1 shares retry state within an instance and does not enforce
  // retry.methods. Isolate each request and select retries by HTTP method here.
  return createClient({
    prefixUrl: env.VITE_API_URL ?? window.location.origin,
    timeout: 30_000,
    ...options,
    retry: retry.methods.some((allowed) => allowed.toUpperCase() === method) ? retry : 0,
  })<T>(input, { method })
}

function withMethod(method: string) {
  return <T = unknown>(input: string | URL, options?: FetchClientOptions) =>
    request<T>(input, { ...options, method })
}

export const fetchClient = Object.assign(request, {
  get: withMethod('GET'),
  post: withMethod('POST'),
  put: withMethod('PUT'),
  patch: withMethod('PATCH'),
  delete: withMethod('DELETE'),
  head: withMethod('HEAD'),
})

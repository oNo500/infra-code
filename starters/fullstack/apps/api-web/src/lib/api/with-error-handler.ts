import 'server-only'
import { ZodError } from 'zod'

type Handler<TContext = unknown> = (request: Request, context: TContext) => Promise<Response> | Response

function isDatabaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  )
}

export function withErrorHandler<TContext>(handler: Handler<TContext>): Handler<TContext> {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          { error: error.issues[0]?.message ?? 'Invalid input' },
          { status: 400 },
        )
      }

      // Drizzle surfaces PostgreSQL error codes on the thrown error object
      if (isDatabaseError(error)) {
        // unique_violation
        if (error.code === '23505') {
          return Response.json({ error: 'Resource already exists' }, { status: 409 })
        }
        // foreign_key_violation
        if (error.code === '23503') {
          return Response.json({ error: 'Referenced resource not found' }, { status: 400 })
        }
        // not_null_violation, check_violation
        if (error.code === '23502' || error.code === '23514') {
          return Response.json({ error: 'Invalid data' }, { status: 400 })
        }
      }

      console.error('[API Error]', error)
      return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
}

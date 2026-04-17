import 'server-only'
import { auth } from '@/lib/auth'

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

type RouteContext<TParams> = {
  params: Promise<TParams>
}

type AuthedHandler<TParams> = (
  request: Request,
  context: RouteContext<TParams> & { session: Session },
) => Promise<Response> | Response

/**
 * Higher-order wrapper for Route Handlers that require an authenticated session.
 *
 * Ensures the handler only runs when a valid Better Auth session exists,
 * otherwise returns a 401 response. The session is injected into the context
 * as `context.session` so handlers can access `session.user.id` directly.
 */
export function withAuth<TParams = Record<string, string>>(handler: AuthedHandler<TParams>) {
  return async (request: Request, context: RouteContext<TParams>) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(request, { ...context, session })
  }
}

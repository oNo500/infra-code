import { buttonVariants } from '@workspace/ui/components/button'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export default function RouteErrorPage() {
  const error = useRouteError()
  const title = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'Something went wrong'

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <h1>{title}</h1>
      <p className="text-muted-foreground">Please try again or return to the home page.</p>
      <Link to="/" className={buttonVariants()}>
        Back to home
      </Link>
    </main>
  )
}

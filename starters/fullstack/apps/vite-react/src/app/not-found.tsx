import { buttonVariants } from '@workspace/ui/components/button'
import { Link } from 'react-router'

import { appPaths } from '@/config/app-paths'

export default function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <h1>404 — Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link to={appPaths.home.href} className={buttonVariants()}>
        Back to home
      </Link>
    </section>
  )
}

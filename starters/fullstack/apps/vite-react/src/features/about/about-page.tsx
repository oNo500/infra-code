import { buttonVariants } from '@workspace/ui/components/button'
import { Link } from 'react-router'

export default function AboutPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <h1>About</h1>
      <p className="max-w-xl text-muted-foreground">
        A React starter built with Vite, Tailwind CSS, shadcn/ui, and React Router.
      </p>
      <Link to="/" className={buttonVariants({ variant: 'outline' })}>
        Back to home
      </Link>
    </section>
  )
}

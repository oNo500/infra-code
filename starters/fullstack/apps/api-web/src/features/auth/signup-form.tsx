'use client'

import { Github } from '@workspace/icons'
import { Button } from '@workspace/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Logo } from '@/components/logo'
import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'
import { authClient } from '@/lib/auth-client'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  function handleGitHubSignIn() {
    setGithubLoading(true)
    void authClient.signIn.social({ provider: 'github' })
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    setError(null)
    setLoading(true)

    const { error: signUpError } = await authClient.signUp.email({ name, email, password })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message ?? 'Signup failed')
      return
    }

    router.push(appPaths.home.href)
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href={appPaths.home.href} className="flex flex-col items-center gap-2 font-medium">
              <Logo />
              <span className="sr-only">{env.NEXT_PUBLIC_APP_NAME}</span>
            </a>
            <h1 className="text-xl font-bold">
              Welcome to
              {env.NEXT_PUBLIC_APP_NAME}
            </h1>
            <FieldDescription>
              Already have an account? <a href={appPaths.auth.login.getHref()}>Sign in</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" name="name" type="text" placeholder="John Doe" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" required />
          </Field>
          {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <Button
              variant="outline"
              type="button"
              onClick={handleGitHubSignIn}
              disabled={githubLoading}
            >
              <Github className="size-4" aria-hidden="true" />
              {githubLoading ? 'Redirecting...' : 'Continue with GitHub'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <a href={appPaths.legal.terms.href}>Terms of Service</a> and{' '}
        <a href={appPaths.legal.privacy.href}>Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

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
import { toast } from 'sonner'

import { Logo } from '@/components/logo'
import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'
import { authClient } from '@/lib/auth-client'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  async function handleGitHubSignIn() {
    setGithubLoading(true)
    try {
      const { error } = await authClient.signIn.social({ provider: 'github' })
      if (error) {
        toast.error(error.message || 'GitHub sign-in failed')
      }
    } catch {
      toast.error('Unable to reach the auth server')
    } finally {
      setGithubLoading(false)
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({ email, password })
      if (error) {
        toast.error(error.message || 'Login failed')
        return
      }
      router.push(appPaths.home.href)
    } catch {
      toast.error('Unable to reach the auth server')
    } finally {
      setLoading(false)
    }
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
              Don&apos;t have an account? <a href={appPaths.auth.signup.getHref()}>Sign up</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" required />
          </Field>
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
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

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Skeleton } from '@workspace/ui/components/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { appPaths } from '@/config/app-paths'
import { authClient } from '@/lib/auth-client'

export function UserMenu({ variant }: { variant: 'desktop' | 'mobile' }) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push(appPaths.auth.login.getHref())
  }

  if (variant === 'mobile') {
    if (isPending) {
      return <Skeleton className="h-9 w-full rounded-md" />
    }

    if (session) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
              <AvatarFallback className="bg-transparent p-0">
                <Skeleton className="size-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session.user.name}</span>
              <span className="text-xs text-muted-foreground">{session.user.email}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
            Sign out
          </Button>
        </div>
      )
    }

    return (
      <Button
        size="sm"
        nativeButton={false}
        render={<Link href={appPaths.auth.login.getHref()} />}
        className="w-full"
      >
        Login
      </Button>
    )
  }

  if (isPending) {
    return <Skeleton className="size-7 rounded-full" />
  }

  if (!session) {
    return (
      <Button size="sm" nativeButton={false} render={<Link href={appPaths.auth.login.getHref()} />}>
        Login
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
            <Avatar className="size-7">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
              <AvatarFallback className="bg-transparent p-0">
                <Skeleton className="size-full rounded-full" />
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <div className="max-w-48 px-2 py-1.5 text-sm">
          <div className="truncate font-medium">{session.user.name}</div>
          <div className="truncate text-muted-foreground">{session.user.email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client'

import { Button } from '@workspace/ui/components/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@workspace/ui/components/drawer'
import { Separator } from '@workspace/ui/components/separator'
import { Menu } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/logo'
import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'

import { UserMenu } from './user-menu'

type NavItem = {
  label: string
  href?: string
  children?: { label: string; href: string }[]
}

export function MobileNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-border">
          <DrawerTitle asChild>
            <Link href={appPaths.home.href} className="flex items-center gap-2 text-foreground">
              <Logo />
              <span className="text-sm font-semibold">{env.NEXT_PUBLIC_APP_NAME}</span>
            </Link>
          </DrawerTitle>
        </DrawerHeader>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="px-2 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {item.label}
                </span>
                {item.children.map((child) => (
                  <DrawerClose key={child.label} asChild>
                    <Link
                      href={child.href}
                      className="rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                    >
                      {child.label}
                    </Link>
                  </DrawerClose>
                ))}
              </div>
            ) : (
              <DrawerClose key={item.label} asChild>
                <Link
                  href={item.href!}
                  className="rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              </DrawerClose>
            ),
          )}
        </nav>
        <Separator />
        <div className="p-4">
          <UserMenu variant="mobile" />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

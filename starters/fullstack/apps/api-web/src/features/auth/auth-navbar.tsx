'use client'

import { Github } from '@workspace/icons'
import { Button } from '@workspace/ui/components/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@workspace/ui/components/navigation-menu'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'

import { UserMenu } from './user-menu'

const MobileNav = dynamic(() => import('./mobile-nav').then((m) => m.MobileNav), { ssr: false })

const navItems = [
  {
    label: 'Products',
    children: [
      {
        label: 'API Platform',
        href: appPaths.home.href,
        description: 'Build and manage your APIs',
      },
      { label: 'Analytics', href: appPaths.home.href, description: 'Insights and monitoring' },
    ],
  },
  { label: 'Docs', href: appPaths.home.href },
  { label: 'Pricing', href: appPaths.home.href },
]

export function AuthNavbar() {
  return (
    <header className="border-b border-border">
      <div className="container py-3.5">
        <div className="flex items-center justify-between">
          {/* Left: logo + desktop nav */}
          <div className="flex items-center gap-6">
            <Link
              href={appPaths.home.href}
              className="flex items-center gap-2 text-foreground"
              aria-label={env.NEXT_PUBLIC_APP_NAME}
            >
              <Logo />
              <span className="text-sm font-semibold">{env.NEXT_PUBLIC_APP_NAME}</span>
            </Link>

            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navItems.map((item) =>
                  item.children ? (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-48 gap-1 p-1">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <NavigationMenuLink
                                render={<Link href={child.href} />}
                                className="flex flex-col gap-0.5"
                              >
                                <span className="font-medium">{child.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {child.description}
                                </span>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuLink
                        render={<Link href={item.href} />}
                        className="px-2.5 py-1.5 text-sm font-medium"
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop: right side */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              render={
                <a
                  href="https://github.com/oNo500/base"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              variant="ghost"
              size="icon"
              aria-label="GitHub"
            >
              <Github className="size-4" aria-hidden="true" />
            </Button>
            <ThemeToggle />
            <UserMenu variant="desktop" />
          </div>

          {/* Mobile: hamburger + drawer */}
          <div className="md:hidden">
            <MobileNav navItems={navItems} />
          </div>
        </div>
      </div>
    </header>
  )
}

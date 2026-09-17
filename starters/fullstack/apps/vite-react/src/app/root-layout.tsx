import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import { Separator } from '@workspace/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { Link, Outlet, useLocation } from 'react-router'

import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'
import { AppSidebar } from '@/features/navigation/app-sidebar'
import { ThemeToggle } from '@/features/theme/theme-toggle'

export default function RootLayout() {
  const { pathname } = useLocation()
  const title =
    pathname === appPaths.home.href
      ? 'Home'
      : pathname === appPaths.about.href
        ? 'About'
        : 'Not found'

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-center"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink render={<Link to={appPaths.home.href} />}>
                  {env.VITE_APP_NAME}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex min-w-0 flex-1 flex-col text-center">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

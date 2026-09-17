import NotFoundPage from '@/app/not-found'
import RootLayout from '@/app/root-layout'
import RouteErrorPage from '@/app/route-error'
import { appPaths } from '@/config/app-paths'
import AboutPage from '@/features/about/about-page'
import HomePage from '@/features/home/home-page'

import type { RouteObject } from 'react-router'

export const routes = [
  {
    path: appPaths.home.href,
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: appPaths.about.href, Component: AboutPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
] satisfies RouteObject[]

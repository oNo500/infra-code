// Nextjs 集中式路由的唯一数据源

export const appPaths = {
  home: {
    href: '/',
  },
  auth: {
    signup: {
      getHref: (redirectTo?: string | null) =>
        `/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      getHref: (redirectTo?: string | null) =>
        `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
  legal: {
    terms: { href: '/terms' },
    privacy: { href: '/privacy' },
  },
  dashboard: {
    posts: {
      href: '/posts',
      getDetailHref: (id: string) => `/posts/${id}`,
    },
  },
}

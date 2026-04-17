// Nextjs 集中式路由的唯一数据源

export const appPaths = {
  home: {
    href: '/',
  },
  auth: {
    register: {
      getHref: (redirectTo?: string | null) =>
        `/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      getHref: (redirectTo?: string | null) =>
        `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
}

// Better Auth client — React hooks (useSession, signIn, signUp, signOut).
import { createAuthClient } from 'better-auth/react'

import { env } from '@/config/env'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
})

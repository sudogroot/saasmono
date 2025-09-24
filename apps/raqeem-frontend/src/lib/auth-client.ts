import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000',
  plugins: [organizationClient()],
})
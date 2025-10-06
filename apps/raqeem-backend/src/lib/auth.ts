import { expo } from '@better-auth/expo'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
// import { nextCookies } from 'better-auth/next-js';
import { db } from '../db'
import { getBetterAuthSecret } from './secrets'

import { openAPI } from 'better-auth/plugins'

import { admin, anonymous, organization, username } from 'better-auth/plugins'
import * as schema from '../db/schema/auth'

const betterAuthOptions: BetterAuthOptions = {
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  secret: getBetterAuthSecret(),
  trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:3001', 'mybettertapp://', 'exp://'],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN,
    },
  },
  plugins: [
    admin(),
    anonymous(),
    openAPI(),
    username(),
    organization(),

    expo(),

    // nextCookies(),
  ],
}

export const auth: ReturnType<typeof betterAuth> = betterAuth(betterAuthOptions)

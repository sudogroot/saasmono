import { expo } from '@better-auth/expo'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
// import { nextCookies } from 'better-auth/next-js';
import { db } from '../db'

import { openAPI } from 'better-auth/plugins'

import { admin, anonymous, organization, username } from 'better-auth/plugins'
import * as schema from '../db/schema/auth'
const betterAuthOptions: BetterAuthOptions = {
  database: drizzleAdapter(db, {
    provider: 'pg',

    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:3001', 'mybettertapp://', 'exp://'],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
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

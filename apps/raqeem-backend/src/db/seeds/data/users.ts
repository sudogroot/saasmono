import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import { eq } from 'drizzle-orm'

import { auth } from '../../../lib/auth'
import * as authSchema from '../../schema/auth'

config()
const { Pool } = pkg

async function runUsersSeed() {
  console.log('👤 Starting users seeding...')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool)

  // Define the single admin user
  const user = {
    id: 'user_admin_001',
    name: 'Admin User',
    email: 'admin@raqeem.com',
    emailVerified: true,
    image: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'admin' as string | null,
    banned: false as boolean | null,
    banReason: null as string | null,
    banExpires: null as Date | null,
    isAnonymous: false as boolean | null,
    username: 'admin' as string | null,
    displayUsername: 'Admin User' as string | null,
  }

  try {
    // Skip if admin already exists
    const existing = await db
      .select({ id: authSchema.user.id })
      .from(authSchema.user)
      .where(eq(authSchema.user.email, user.email))
      .limit(1)

    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists, skipping user creation...')
      await pool.end()
      return
    }

    // Hash a default password for credentials login
    const hashedPassword = await (await auth.$context).password.hash('password1234')

    await db.transaction(async (tx) => {
      // Insert user
      await tx.insert(authSchema.user).values(user)

      // Insert credentials account for the user
      await tx.insert(authSchema.account).values({
        id: `account_${user.id}`,
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    console.log('✅ Admin user seeded successfully:')
    console.log('- Email: admin@raqeem.com')
    console.log('- Password: password1234')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the seed
runUsersSeed().catch((error) => {
  console.error('💥 Users seeding failed:', error)
  process.exit(1)
})

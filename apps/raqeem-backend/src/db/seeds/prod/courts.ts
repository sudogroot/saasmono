import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import { courts } from '../../schema/courts'
import { courtsData } from '../data/courts'

config()
const { Pool } = pkg

async function runCourtsSeed() {
  console.log('🏛️ Starting courts seeding...')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool)

  try {
    // Check if courts already exist to avoid duplicates
    const existingCourts = await db.select().from(courts).limit(1)

    if (existingCourts.length > 0) {
      console.log('⚠️  Courts already seeded, skipping...')
      return
    }

    // Insert courts data
    const result = await db.insert(courts).values(courtsData).returning({ id: courts.id })

    console.log(`✅ Successfully seeded ${result.length} courts`)
    console.log('🎉 Courts seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding courts:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the seed
runCourtsSeed().catch((error) => {
  console.error('💥 Courts seeding failed:', error)
  process.exit(1)
})

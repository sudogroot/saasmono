import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as educationSchema from '../../schema/education'
import { INSTITUTION_LEVELS, seedInstitutionLevels } from '../utils/seedEducation'
config()
const { Pool } = pkg

async function runInstitutionLevelsSeed() {
  console.log('🌱 Starting institution levels seed\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, { schema: educationSchema })

  try {
    const result = await seedInstitutionLevels(db)

    const existingCount = result.filter((level) => INSTITUTION_LEVELS.some((il) => il.name === level.name)).length

    const newCount = result.length - existingCount

    if (newCount === 0) {
      console.log('⚠️  All institution levels already exist. Skipping seed.')
      return
    }

    console.log(`📚 Created ${newCount} new institution levels...`)
    console.log(`✅ Total institution levels: ${result.length}`)

    result.forEach((level) => {
      console.log(`  - ${level.name}: ${level.displayNameEn}`)
    })

    console.log('\n🎉 Institution levels seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the seed
runInstitutionLevelsSeed().catch((error) => {
  console.error('❌ Institution levels seed process failed:', error)
  process.exit(1)
})

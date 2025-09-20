import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as educationSchema from '../../schema/education'

config()
const { Pool } = pkg

async function debugEducationLevels(orgId: string) {
  console.log(`🔍 Debugging education levels for organization: ${orgId}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, { schema: educationSchema })

  try {
    // Get education levels for this organization
    const educationLevels = await db
      .select()
      .from(educationSchema.educationLevel)
      .where(eq(educationSchema.educationLevel.orgId, orgId))

    console.log(`Found ${educationLevels.length} education levels:\n`)

    educationLevels.forEach((level, index) => {
      console.log(`${index + 1}. Level ${level.level}`)
      console.log(`   ID: ${level.id}`)
      console.log(`   Section: ${level.section || 'null'}`)
      console.log(`   Display Name AR: ${level.displayNameAr || 'null'}`)
      console.log(`   Display Name EN: ${level.displayNameEn || 'null'}`)
      console.log(`   Institution Level ID: ${level.institutionLevelId}`)
      console.log(`   Is Default: ${level.isDefault}`)
      console.log(`   Created: ${level.createdAt}`)
      console.log('')
    })

    // Show what keys would be generated for matching
    console.log('Generated matching keys:')
    educationLevels.forEach((level) => {
      const keyWithSection = level.section ? `${level.level}-${level.section}` : null
      const keyLevelOnly = level.level.toString()

      console.log(`Level ${level.level}:`)
      console.log(`  - Level only key: "${keyLevelOnly}"`)
      if (keyWithSection) {
        console.log(`  - With section key: "${keyWithSection}"`)
      }
      console.log(`  - Section: "${level.section || 'null'}"`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Debug failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: tsx src/db/seeds/utils/debugEducationLevels.ts <orgId>')
  process.exit(1)
}

// Run the debug
debugEducationLevels(orgId).catch((error) => {
  console.error('❌ Debug process failed:', error)
  process.exit(1)
})
import { config } from 'dotenv'
import pkg from 'pg'
import * as readline from 'readline'
config()
const { Pool } = pkg

// Check if we're in a development environment
function checkDevEnvironment() {
  const env = process.env.NODE_ENV
  const dbUrl = process.env.DATABASE_URL || ''

  // Check if we're in production
  if (env === 'production') {
    console.error('🚨 SAFETY CHECK FAILED: Cannot run reset in production environment!')
    process.exit(1)
  }

  // Check if database URL contains production indicators
  const prodIndicators = ['prod', 'production', 'live']
  const hasProductionIndicator = prodIndicators.some((indicator) => dbUrl.toLowerCase().includes(indicator))

  if (hasProductionIndicator) {
    console.error('🚨 SAFETY CHECK FAILED: Database URL appears to be production!')
    console.error('Database URL contains production indicators:', dbUrl)
    process.exit(1)
  }

  console.log('✅ Environment check passed: Development environment detected')
  console.log(`📍 NODE_ENV: ${env || 'not set'}`)
  console.log(`📍 Database: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`)
}

// Create readline interface for user input
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

// Prompt user for confirmation
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function resetDatabase() {
  console.log('🔥 DATABASE RESET UTILITY 🔥\n')

  // First safety check
  checkDevEnvironment()

  const rl = createReadlineInterface()

  try {
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA in the database!')
    console.log('This action cannot be undone.\n')

    // First confirmation
    const firstConfirm = await askQuestion(rl, 'Are you sure you want to reset the database? (yes/no): ')

    if (firstConfirm.toLowerCase() !== 'yes') {
      console.log('❌ Reset cancelled.')
      return
    }

    // Second confirmation with special phrase
    console.log('\n🔐 Safety confirmation required.')
    console.log('Please type exactly: reset_not_prod\n')

    const safetyPhrase = await askQuestion(rl, 'Type the safety phrase: ')

    if (safetyPhrase !== 'reset_not_prod') {
      console.log('❌ Incorrect safety phrase. Reset cancelled.')
      return
    }

    console.log('\n🚀 Proceeding with database reset...\n')

    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    })

    // Run all operations in a transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Delete data in order (respecting foreign key constraints)
      console.log('🗑️  Deleting education level-subject relationships...')
      await client.query('DELETE FROM "education_level_subject"')

      console.log('🗑️  Deleting education subjects...')
      await client.query('DELETE FROM "education_subject"')

      console.log('🗑️  Deleting education levels...')
      await client.query('DELETE FROM "education_level"')

      console.log('🗑️  Deleting organization configs...')
      await client.query('DELETE FROM "organization_config"')

      console.log('🗑️  Deleting parent-student relationships...')
      await client.query('DELETE FROM "parent_student_relation"')

      console.log('🗑️  Deleting invitations...')
      await client.query('DELETE FROM "invitation"')

      console.log('🗑️  Deleting organization members...')
      await client.query('DELETE FROM "member"')

      console.log('🗑️  Deleting user sessions...')
      await client.query('DELETE FROM "session"')

      console.log('🗑️  Deleting user accounts...')
      await client.query('DELETE FROM "account"')

      console.log('🗑️  Deleting verification records...')
      await client.query('DELETE FROM "verification"')

      console.log('🗑️  Deleting users...')
      await client.query('DELETE FROM "user"')

      console.log('🗑️  Deleting organizations...')
      await client.query('DELETE FROM "organization"')

      console.log('🔄 Resetting database sequences...')
      // Reset any auto-increment sequences if they exist
      await client.query(`
        DO $$
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT schemaname, sequencename FROM pg_sequences WHERE schemaname = 'public')
          LOOP
            EXECUTE 'ALTER SEQUENCE ' || quote_ident(r.schemaname) || '.' || quote_ident(r.sequencename) || ' RESTART WITH 1';
          END LOOP;
        END $$;
      `)

      await client.query('COMMIT')
      console.log('\n✅ Database reset completed successfully!')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    console.log('📊 All tables have been cleared.')
    console.log('💡 You may want to run the seed script next: pnpm run seed:users')

    await pool.end()
  } catch (error) {
    console.error('❌ Reset failed:', error)
    throw error
  } finally {
    rl.close()
  }
}

// Run the reset
resetDatabase().catch((error) => {
  console.error('❌ Database reset process failed:', error)
  process.exit(1)
})

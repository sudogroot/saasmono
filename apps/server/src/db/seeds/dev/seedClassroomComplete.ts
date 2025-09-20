import { config } from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'

config()

const execAsync = promisify(exec)

async function runCommand(command: string, description: string) {
  console.log(`\n🚀 ${description}`)
  console.log(`📝 Running: ${command}`)

  try {
    const { stdout, stderr } = await execAsync(command)
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    console.log(`✅ ${description} completed successfully`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error)
    throw error
  }
}

async function seedClassroomComplete(orgId: string) {
  console.log('🏫 COMPLETE CLASSROOM SEEDING PROCESS')
  console.log('=====================================')
  console.log(`Organization: ${orgId}`)
  console.log(`Started at: ${new Date().toLocaleString()}`)

  try {
    // Prerequisites check
    console.log('\n📋 Prerequisites:')
    console.log('1. Organization must exist')
    console.log('2. Users (including teachers) must be seeded')
    console.log('3. Education levels and subjects must be seeded')
    console.log('4. Institution levels must be seeded')

    // Run seeds in sequence
    await runCommand(
      `tsx src/db/seeds/dev/classrooms.ts ${orgId}`,
      'Step 1: Creating classrooms'
    )

    await runCommand(
      `tsx src/db/seeds/dev/classroomGroups.ts ${orgId}`,
      'Step 2: Creating classroom groups'
    )

    await runCommand(
      `tsx src/db/seeds/dev/teacherAssignments.ts ${orgId}`,
      'Step 3: Assigning teachers to classrooms and subjects'
    )

    await runCommand(
      `tsx src/db/seeds/dev/studentEnrollments.ts ${orgId}`,
      'Step 4: Enrolling students in classrooms'
    )

    await runCommand(
      `tsx src/db/seeds/dev/groupMemberships.ts ${orgId}`,
      'Step 5: Assigning students to classroom groups'
    )

    console.log('\n🎉 COMPLETE CLASSROOM SEEDING SUCCESSFUL!')
    console.log('=========================================')
    console.log('✅ All classroom-related data has been seeded')
    console.log('✅ Classrooms created with proper education levels')
    console.log('✅ Classroom groups created (default + specialized)')
    console.log('✅ Teachers assigned to subjects in classrooms')
    console.log('✅ Students enrolled in classrooms')
    console.log('✅ Students assigned to classroom groups')
    console.log(`\n📊 You can now view the data using: pnpm run db:studio`)
    console.log(`🔍 Or check tables with: pnpm run db:show-tables`)

  } catch (error) {
    console.error('\n❌ CLASSROOM SEEDING FAILED!')
    console.error('============================')
    console.error('The seeding process was interrupted due to an error.')
    console.error('Please check the error above and resolve any issues.')
    console.error('\n💡 Common issues:')
    console.error('- Organization does not exist')
    console.error('- No teachers found (run seed:users first)')
    console.error('- No education data (run seed:level:secondaire first)')
    console.error('- Database connection issues')
    throw error
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('')
  console.error('Usage: pnpm run seed:classroom-complete <orgId>')
  console.error('Example: pnpm run seed:classroom-complete org_default_school')
  console.error('')
  console.error('📋 Prerequisites (run these first):')
  console.error('1. pnpm run seed:users <orgId>')
  console.error('2. pnpm run seed:level:secondaire <orgId>')
  console.error('3. pnpm run seed:institutionLevel')
  process.exit(1)
}

// Run the complete seeding process
seedClassroomComplete(orgId).catch((error) => {
  console.error('❌ Complete classroom seeding process failed:', error)
  process.exit(1)
})
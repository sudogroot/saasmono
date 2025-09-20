import { config } from 'dotenv'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'
import * as educationSchema from '../../schema/education'

config()
const { Pool } = pkg

// Classroom data for SECONDAIRE levels (matching actual seeded education levels 1-4)
const CLASSROOM_DATA = [
  // First Year Common (Level 1)
  { name: 'الأولى ثانوي أ', code: '1AS-A', level: 1, academicYear: '2024-2025', section: 'COMMUN' },
  { name: 'الأولى ثانوي ب', code: '1AS-B', level: 1, academicYear: '2024-2025', section: 'COMMUN' },
  { name: 'الأولى ثانوي ج', code: '1AS-C', level: 1, academicYear: '2024-2025', section: 'COMMUN' },

  // Second Year Science (Level 2)
  { name: 'الثانية ثانوي علوم أ', code: '2AS-SCI-A', level: 2, academicYear: '2024-2025', section: 'SCIENCE' },
  { name: 'الثانية ثانوي علوم ب', code: '2AS-SCI-B', level: 2, academicYear: '2024-2025', section: 'SCIENCE' },

  // Second Year Literature (Level 2)
  { name: 'الثانية ثانوي آداب أ', code: '2AS-LIT-A', level: 2, academicYear: '2024-2025', section: 'LITERATURE' },
  { name: 'الثانية ثانوي آداب ب', code: '2AS-LIT-B', level: 2, academicYear: '2024-2025', section: 'LITERATURE' },

  // Third Year Science Branches (Level 3)
  { name: 'الثالثة ثانوي علوم تجريبية', code: '3AS-EXP', level: 3, academicYear: '2024-2025', section: 'SCIENCE' },
  { name: 'الثالثة ثانوي رياضيات', code: '3AS-MATH', level: 3, academicYear: '2024-2025', section: 'MATH' },
  { name: 'الثالثة ثانوي تقني رياضي', code: '3AS-TECH', level: 3, academicYear: '2024-2025', section: 'TECHNICAL_MATH' },

  // Third Year Literature Branches (Level 3)
  { name: 'الثالثة ثانوي آداب وفلسفة', code: '3AS-LIT-PHIL', level: 3, academicYear: '2024-2025', section: 'LITERATURE' },
  { name: 'الثالثة ثانوي لغات أجنبية', code: '3AS-LANG', level: 3, academicYear: '2024-2025', section: 'FOREIGN_LANGUAGES' },

  // Previous year classrooms for comparison (Level 4)
  { name: 'الثالثة ثانوي علوم تجريبية (2023)', code: '3AS-EXP-2023', level: 4, academicYear: '2023-2024', section: 'SCIENCE' },
  { name: 'الثالثة ثانوي رياضيات (2023)', code: '3AS-MATH-2023', level: 4, academicYear: '2023-2024', section: 'MATH' },
]

async function seedClassrooms(orgId: string) {
  console.log(`🏫 Starting classroom seed for organization: ${orgId}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, {
    schema: {
      ...educationSchema,
      ...classroomSchema,
      ...authSchema
    }
  })

  try {
    // Check if organization exists
    console.log('🔍 Checking organization...')
    const organizations = await db
      .select()
      .from(authSchema.organization)
      .where(eq(authSchema.organization.id, orgId))

    if (organizations.length === 0) {
      throw new Error(`Organization with ID "${orgId}" not found. Please create the organization first.`)
    }

    console.log('✅ Organization found')

    // Check if classrooms already exist
    console.log('🔍 Checking existing classrooms...')
    const existingClassrooms = await db
      .select()
      .from(classroomSchema.classroom)
      .where(eq(classroomSchema.classroom.orgId, orgId))

    if (existingClassrooms.length > 0) {
      console.log(`⚠️  Found ${existingClassrooms.length} existing classrooms for organization ${orgId}`)
      console.log('Skipping classroom seed to avoid duplicates.')
      return { classrooms: [], message: 'Classrooms already exist' }
    }

    // Get education levels for this organization
    console.log('📚 Fetching education levels...')
    const educationLevels = await db
      .select()
      .from(educationSchema.educationLevel)
      .where(eq(educationSchema.educationLevel.orgId, orgId))

    if (educationLevels.length === 0) {
      throw new Error(`No education levels found for organization ${orgId}. Please run education seed first.`)
    }

    console.log(`✅ Found ${educationLevels.length} education levels`)

    // Create level lookup map
    const levelMap = new Map()
    educationLevels.forEach(level => {
      const key = level.section ? `${level.level}-${level.section}` : level.level.toString()
      levelMap.set(key, level.id)
      levelMap.set(level.level.toString(), level.id) // Also map by level only
    })

    // Insert classrooms
    console.log('🏫 Creating classrooms...')
    const createdClassrooms = []

    for (const classroomData of CLASSROOM_DATA) {
      // Try to find matching education level
      let educationLevelId = null

      // First try with section
      if (classroomData.section) {
        const keyWithSection = `${classroomData.level}-${classroomData.section}`
        educationLevelId = levelMap.get(keyWithSection)
      }

      // If not found, try with level only
      if (!educationLevelId) {
        educationLevelId = levelMap.get(classroomData.level.toString())
      }

      if (!educationLevelId) {
        console.log(`⚠️  Skipping ${classroomData.name} - no matching education level found`)
        continue
      }

      const [classroom] = await db
        .insert(classroomSchema.classroom)
        .values({
          name: classroomData.name,
          code: classroomData.code,
          academicYear: classroomData.academicYear,
          capacity: Math.floor(Math.random() * 15) + 25, // Random capacity 25-40
          educationLevelId,
          orgId,
        })
        .returning()

      createdClassrooms.push(classroom)
      console.log(`  ✅ Created: ${classroom.name} (${classroom.code})`)
    }

    console.log('\n🎉 Classroom seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdClassrooms.length} classrooms created`)
    console.log(`  - Academic years: ${[...new Set(CLASSROOM_DATA.map(c => c.academicYear))].join(', ')}`)

    return {
      classrooms: createdClassrooms,
      summary: {
        total: createdClassrooms.length,
        academicYears: [...new Set(CLASSROOM_DATA.map(c => c.academicYear))]
      }
    }

  } catch (error) {
    console.error('❌ Classroom seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:classrooms <orgId>')
  console.error('Example: pnpm run seed:classrooms org_default_school')
  process.exit(1)
}

// Run the seed
seedClassrooms(orgId).catch((error) => {
  console.error('❌ Classroom seed process failed:', error)
  process.exit(1)
})
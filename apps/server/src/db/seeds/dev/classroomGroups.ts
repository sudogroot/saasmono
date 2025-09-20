import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'

config()
const { Pool } = pkg

// Classroom group data templates
const GROUP_TEMPLATES = [
  // Default groups for all classrooms
  { name: 'جميع الطلاب', code: 'ALL', description: 'المجموعة الافتراضية لجميع طلاب الفصل', isDefault: true, maxCapacity: null },

  // Common ability-based groups
  { name: 'المجموعة المتفوقة', code: 'ADVANCED', description: 'مجموعة الطلاب المتفوقين', isDefault: false, maxCapacity: 15 },
  { name: 'المجموعة المتوسطة', code: 'INTERMEDIATE', description: 'مجموعة الطلاب متوسطي المستوى', isDefault: false, maxCapacity: 18 },
  { name: 'مجموعة الدعم', code: 'SUPPORT', description: 'مجموعة الطلاب المحتاجين للدعم الإضافي', isDefault: false, maxCapacity: 12 },

  // Language groups
  { name: 'مجموعة اللغة الفرنسية', code: 'FRENCH', description: 'مجموعة خاصة لطلاب اللغة الفرنسية المتقدمة', isDefault: false, maxCapacity: 20 },
  { name: 'مجموعة اللغة الإنجليزية', code: 'ENGLISH', description: 'مجموعة خاصة لطلاب اللغة الإنجليزية المتقدمة', isDefault: false, maxCapacity: 20 },

  // Science lab groups
  { name: 'مجموعة المختبر أ', code: 'LAB_A', description: 'المجموعة الأولى للأعمال المخبرية', isDefault: false, maxCapacity: 16 },
  { name: 'مجموعة المختبر ب', code: 'LAB_B', description: 'المجموعة الثانية للأعمال المخبرية', isDefault: false, maxCapacity: 16 },

  // Project groups
  { name: 'مجموعة المشاريع', code: 'PROJECTS', description: 'مجموعة خاصة للمشاريع العلمية والبحثية', isDefault: false, maxCapacity: 10 },

  // Remedial groups
  { name: 'مجموعة التقوية', code: 'REMEDIAL', description: 'مجموعة للطلاب المحتاجين لتقوية إضافية', isDefault: false, maxCapacity: 8 },
]

// Specific groups for different classroom types
const SPECIALIZED_GROUPS = {
  // Science classes get lab groups
  science: [
    { name: 'مجموعة الفيزياء', code: 'PHYSICS', description: 'مجموعة خاصة لتجارب الفيزياء', maxCapacity: 15 },
    { name: 'مجموعة الكيمياء', code: 'CHEMISTRY', description: 'مجموعة خاصة لتجارب الكيمياء', maxCapacity: 14 },
    { name: 'مجموعة الأحياء', code: 'BIOLOGY', description: 'مجموعة خاصة لتجارب علم الأحياء', maxCapacity: 16 },
  ],

  // Math classes get problem-solving groups
  math: [
    { name: 'مجموعة حل المسائل', code: 'PROBLEM_SOLVING', description: 'مجموعة خاصة لحل المسائل المتقدمة', maxCapacity: 12 },
    { name: 'مجموعة الهندسة', code: 'GEOMETRY', description: 'مجموعة خاصة للهندسة الرياضية', maxCapacity: 15 },
  ],

  // Literature classes get discussion groups
  literature: [
    { name: 'مجموعة النقاش الأدبي', code: 'LIT_DISCUSSION', description: 'مجموعة للنقاش الأدبي والتحليل', maxCapacity: 18 },
    { name: 'مجموعة الكتابة الإبداعية', code: 'CREATIVE_WRITING', description: 'مجموعة للكتابة الإبداعية', maxCapacity: 12 },
  ],
}

async function seedClassroomGroups(orgId: string) {
  console.log(`👥 Starting classroom groups seed for organization: ${orgId}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, {
    schema: {
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
      throw new Error(`Organization with ID "${orgId}" not found.`)
    }

    console.log('✅ Organization found')

    // Get all classrooms for this organization
    console.log('🏫 Fetching classrooms...')
    const classrooms = await db
      .select()
      .from(classroomSchema.classroom)
      .where(eq(classroomSchema.classroom.orgId, orgId))

    if (classrooms.length === 0) {
      throw new Error(`No classrooms found for organization ${orgId}. Please run classroom seed first.`)
    }

    console.log(`✅ Found ${classrooms.length} classrooms`)

    // Check if groups already exist
    console.log('🔍 Checking existing classroom groups...')
    const existingGroups = await db
      .select()
      .from(classroomSchema.classroomGroup)
      .where(eq(classroomSchema.classroomGroup.orgId, orgId))

    if (existingGroups.length > 0) {
      console.log(`⚠️  Found ${existingGroups.length} existing classroom groups for organization ${orgId}`)
      console.log('Skipping classroom groups seed to avoid duplicates.')
      return { groups: [], message: 'Classroom groups already exist' }
    }

    // Create groups for each classroom
    console.log('👥 Creating classroom groups...')
    const createdGroups = []

    for (const classroom of classrooms) {
      console.log(`\n📍 Creating groups for: ${classroom.name}`)

      // Add basic groups for all classrooms
      for (const template of GROUP_TEMPLATES) {
        const [group] = await db
          .insert(classroomSchema.classroomGroup)
          .values({
            name: template.name,
            code: `${classroom.code}_${template.code}`,
            description: template.description,
            maxCapacity: template.maxCapacity,
            isDefault: template.isDefault,
            classroomId: classroom.id,
            orgId,
          })
          .returning()

        createdGroups.push(group)
        console.log(`  ✅ ${group.name} (${group.code})`)
      }

      // Add specialized groups based on classroom type
      const classroomName = classroom.name.toLowerCase()

      if (classroomName.includes('علوم') || classroomName.includes('تجريبية')) {
        console.log(`  🧪 Adding science-specific groups...`)
        for (const template of SPECIALIZED_GROUPS.science) {
          const [group] = await db
            .insert(classroomSchema.classroomGroup)
            .values({
              name: template.name,
              code: `${classroom.code}_${template.code}`,
              description: template.description,
              maxCapacity: template.maxCapacity,
              isDefault: false,
              classroomId: classroom.id,
              orgId,
            })
            .returning()

          createdGroups.push(group)
          console.log(`  ✅ ${group.name} (${group.code})`)
        }
      }

      if (classroomName.includes('رياضيات') || classroomName.includes('تقني')) {
        console.log(`  🔢 Adding math-specific groups...`)
        for (const template of SPECIALIZED_GROUPS.math) {
          const [group] = await db
            .insert(classroomSchema.classroomGroup)
            .values({
              name: template.name,
              code: `${classroom.code}_${template.code}`,
              description: template.description,
              maxCapacity: template.maxCapacity,
              isDefault: false,
              classroomId: classroom.id,
              orgId,
            })
            .returning()

          createdGroups.push(group)
          console.log(`  ✅ ${group.name} (${group.code})`)
        }
      }

      if (classroomName.includes('آداب') || classroomName.includes('فلسفة') || classroomName.includes('لغات')) {
        console.log(`  📚 Adding literature-specific groups...`)
        for (const template of SPECIALIZED_GROUPS.literature) {
          const [group] = await db
            .insert(classroomSchema.classroomGroup)
            .values({
              name: template.name,
              code: `${classroom.code}_${template.code}`,
              description: template.description,
              maxCapacity: template.maxCapacity,
              isDefault: false,
              classroomId: classroom.id,
              orgId,
            })
            .returning()

          createdGroups.push(group)
          console.log(`  ✅ ${group.name} (${group.code})`)
        }
      }
    }

    console.log('\n🎉 Classroom groups seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdGroups.length} classroom groups created`)
    console.log(`  - ${classrooms.length} classrooms processed`)

    const defaultGroups = createdGroups.filter(g => g.isDefault)
    console.log(`  - ${defaultGroups.length} default groups`)
    console.log(`  - ${createdGroups.length - defaultGroups.length} specialized groups`)

    return {
      groups: createdGroups,
      summary: {
        total: createdGroups.length,
        classrooms: classrooms.length,
        defaultGroups: defaultGroups.length,
        specializedGroups: createdGroups.length - defaultGroups.length
      }
    }

  } catch (error) {
    console.error('❌ Classroom groups seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:classroom-groups <orgId>')
  console.error('Example: pnpm run seed:classroom-groups org_default_school')
  process.exit(1)
}

// Run the seed
seedClassroomGroups(orgId).catch((error) => {
  console.error('❌ Classroom groups seed process failed:', error)
  process.exit(1)
})
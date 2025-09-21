import { config } from 'dotenv'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'
import * as educationSchema from '../../schema/education'

config()
const { Pool } = pkg

// Subject assignments by specialization
const SUBJECT_ASSIGNMENTS = {
  // Common subjects for all levels
  common: [
    'التربية الإسلامية',
    'اللغة العربية وآدابها',
    'التاريخ والجغرافيا',
    'التربية البدنية والرياضية',
    'التربية الفنية',
  ],

  // Science specialization subjects
  science: [
    'الرياضيات',
    'العلوم الفيزيائية',
    'علوم الطبيعة والحياة',
    'اللغة الفرنسية',
    'اللغة الإنجليزية',
  ],

  // Math specialization subjects
  math: [
    'الرياضيات',
    'العلوم الفيزيائية',
    'اللغة الفرنسية',
    'اللغة الإنجليزية',
    'الفلسفة',
  ],

  // Literature specialization subjects
  literature: [
    'الفلسفة',
    'اللغة الفرنسية',
    'اللغة الإنجليزية',
    'الأمازيغية',
  ],

  // Technical math subjects
  technical: [
    'الرياضيات',
    'العلوم الفيزيائية',
    'الهندسة المدنية',
    'الهندسة الميكانيكية',
    'الهندسة الكهربائية',
    'اللغة الفرنسية',
  ],

  // Foreign languages subjects
  languages: [
    'اللغة الفرنسية',
    'اللغة الإنجليزية',
    'اللغة الألمانية',
    'اللغة الإسبانية',
    'الأدب الفرنسي',
    'الأدب الإنجليزي',
  ],
}

// Role distribution patterns
const ROLE_PATTERNS = [
  { role: 'teacher', isMainTeacher: 'true', weight: 0.7 },  // 70% main teachers
  { role: 'teacher', isMainTeacher: 'false', weight: 0.2 }, // 20% assistant teachers
  { role: 'assistant', isMainTeacher: 'false', weight: 0.1 }, // 10% teaching assistants
]

function getSubjectsForClassroom(classroomName: string): string[] {
  const name = classroomName.toLowerCase()
  let subjects = [...SUBJECT_ASSIGNMENTS.common]

  // Add specialized subjects based on classroom type
  if (name.includes('علوم تجريبية')) {
    subjects.push(...SUBJECT_ASSIGNMENTS.science)
  } else if (name.includes('رياضيات') && !name.includes('تقني')) {
    subjects.push(...SUBJECT_ASSIGNMENTS.math)
  } else if (name.includes('تقني رياضي')) {
    subjects.push(...SUBJECT_ASSIGNMENTS.technical)
  } else if (name.includes('آداب') || name.includes('فلسفة')) {
    subjects.push(...SUBJECT_ASSIGNMENTS.literature)
  } else if (name.includes('لغات أجنبية')) {
    subjects.push(...SUBJECT_ASSIGNMENTS.languages)
  } else {
    // First year or general - add basic science and humanities
    subjects.push('الرياضيات', 'العلوم الفيزيائية', 'علوم الطبيعة والحياة', 'اللغة الفرنسية', 'الفلسفة')
  }

  return [...new Set(subjects)] // Remove duplicates
}

function getRandomRole(): { role: string; isMainTeacher: string } {
  const random = Math.random()
  let cumulative = 0

  for (const pattern of ROLE_PATTERNS) {
    cumulative += pattern.weight
    if (random <= cumulative) {
      return {
        role: pattern.role,
        isMainTeacher: pattern.isMainTeacher
      }
    }
  }

  // Fallback
  return { role: 'teacher', isMainTeacher: 'true' }
}

async function seedTeacherAssignments(orgId: string) {
  console.log(`👨‍🏫 Starting teacher assignments seed for organization: ${orgId}\n`)

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
      throw new Error(`Organization with ID "${orgId}" not found.`)
    }

    console.log('✅ Organization found')

    // Get teachers from organization
    console.log('👥 Fetching teachers...')
    const teachers = await db
      .select({
        id: authSchema.user.id,
        name: authSchema.user.name,
        lastName: authSchema.user.lastName,
        email: authSchema.user.email,
      })
      .from(authSchema.user)
      .innerJoin(authSchema.member, eq(authSchema.user.id, authSchema.member.userId))
      .where(
        and(
          eq(authSchema.member.organizationId, orgId),
          eq(authSchema.user.userType, 'teacher')
        )
      )

    if (teachers.length === 0) {
      console.log('⚠️  No teachers found for this organization.')
      console.log('Please run user seed with teachers first: pnpm run seed:users <orgId>')
      return { assignments: [], message: 'No teachers found' }
    }

    console.log(`✅ Found ${teachers.length} teachers`)

    // Get classrooms
    console.log('🏫 Fetching classrooms...')
    const classrooms = await db
      .select()
      .from(classroomSchema.classroom)
      .where(eq(classroomSchema.classroom.orgId, orgId))

    if (classrooms.length === 0) {
      throw new Error(`No classrooms found for organization ${orgId}. Please run classroom seed first.`)
    }

    console.log(`✅ Found ${classrooms.length} classrooms`)

    // Get education subjects
    console.log('📚 Fetching education subjects...')
    const educationSubjects = await db
      .select()
      .from(educationSchema.educationSubject)
      .where(eq(educationSchema.educationSubject.orgId, orgId))

    if (educationSubjects.length === 0) {
      throw new Error(`No education subjects found for organization ${orgId}. Please run education seed first.`)
    }

    console.log(`✅ Found ${educationSubjects.length} education subjects`)

    // Create subject lookup map
    const subjectMap = new Map()
    educationSubjects.forEach(subject => {
      subjectMap.set(subject.displayNameAr, subject.id)
      subjectMap.set(subject.name, subject.id)
    })

    // Check if assignments already exist
    console.log('🔍 Checking existing assignments...')
    const existingAssignments = await db
      .select()
      .from(classroomSchema.classroomTeacherAssignment)
      .where(eq(classroomSchema.classroomTeacherAssignment.orgId, orgId))

    if (existingAssignments.length > 0) {
      console.log(`⚠️  Found ${existingAssignments.length} existing teacher assignments for organization ${orgId}`)
      console.log('Skipping teacher assignments seed to avoid duplicates.')
      return { assignments: [], message: 'Teacher assignments already exist' }
    }

    // Create assignments
    console.log('📝 Creating teacher assignments...')
    const createdAssignments = []
    let assignmentCount = 0

    for (const classroom of classrooms) {
      console.log(`\n📍 Processing: ${classroom.name}`)

      const requiredSubjects = getSubjectsForClassroom(classroom.name)
      const availableSubjects = requiredSubjects.filter(subjectName =>
        subjectMap.has(subjectName)
      )

      console.log(`  📚 Required subjects: ${availableSubjects.length}`)

      if (availableSubjects.length === 0) {
        console.log(`  ⚠️  No matching subjects found for ${classroom.name}`)
        continue
      }

      // Assign teachers to subjects
      for (const subjectName of availableSubjects) {
        const subjectId = subjectMap.get(subjectName)

        // Assign 1-2 teachers per subject depending on class size and subject importance
        const isImportantSubject = ['الرياضيات', 'اللغة العربية وآدابها', 'العلوم الفيزيائية'].includes(subjectName)
        const teacherCount = isImportantSubject && Math.random() > 0.7 ? 2 : 1

        const shuffledTeachers = [...teachers].sort(() => Math.random() - 0.5)
        const selectedTeachers = shuffledTeachers.slice(0, teacherCount)

        for (let i = 0; i < selectedTeachers.length; i++) {
          const teacher = selectedTeachers[i]
          if (!teacher) {
            console.log(`    ⚠️  No teacher found at index ${i}`)
            continue
          }

          const roleInfo = getRandomRole()

          // Ensure at least one main teacher per subject
          if (i === 0 && teacherCount > 1) {
            roleInfo.isMainTeacher = 'true'
            roleInfo.role = 'teacher'
          }

          try {
            const [assignment] = await db
              .insert(classroomSchema.classroomTeacherAssignment)
              .values({
                classroomId: classroom.id,
                teacherId: teacher.id,
                educationSubjectId: subjectId,
                role: roleInfo.role,
                isMainTeacher: roleInfo.isMainTeacher,
                orgId,
              })
              .returning()

            if (!assignment) throw new Error(`Failed to create teacher assignment for ${teacher.name}`)
            createdAssignments.push(assignment)
            assignmentCount++

            const roleLabel = roleInfo.isMainTeacher === 'true' ? 'رئيسي' : 'مساعد'
            console.log(`    ✅ ${teacher.name} ${teacher.lastName} → ${subjectName} (${roleLabel})`)

          } catch (error) {
            // Skip if duplicate assignment (teacher already assigned to this subject in this classroom)
            if ((error as Error).message?.includes('duplicate') || (error as Error).message?.includes('unique')) {
              console.log(`    ⚠️  Skipping duplicate assignment: ${teacher.name} → ${subjectName}`)
              continue
            }
            throw error
          }
        }
      }
    }

    console.log('\n🎉 Teacher assignments seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdAssignments.length} teacher assignments created`)
    console.log(`  - ${classrooms.length} classrooms processed`)
    console.log(`  - ${teachers.length} teachers available`)

    const mainTeachers = createdAssignments.filter(a => a && a.isMainTeacher === 'true')
    console.log(`  - ${mainTeachers.length} main teacher assignments`)
    console.log(`  - ${createdAssignments.length - mainTeachers.length} assistant/support assignments`)

    return {
      assignments: createdAssignments,
      summary: {
        total: createdAssignments.length,
        classrooms: classrooms.length,
        teachers: teachers.length,
        mainTeachers: mainTeachers.length,
        assistants: createdAssignments.length - mainTeachers.length
      }
    }

  } catch (error) {
    console.error('❌ Teacher assignments seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:teacher-assignments <orgId>')
  console.error('Example: pnpm run seed:teacher-assignments org_default_school')
  process.exit(1)
}

// Run the seed
seedTeacherAssignments(orgId).catch((error) => {
  console.error('❌ Teacher assignments seed process failed:', error)
  process.exit(1)
})
import { config } from 'dotenv'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'

config()
const { Pool } = pkg

async function seedStudentEnrollments(orgId: string) {
  console.log(`🎓 Starting student enrollments seed for organization: ${orgId}\n`)

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

    // Get students from organization
    console.log('👥 Fetching students...')
    const students = await db
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
          eq(authSchema.user.userType, 'student')
        )
      )

    if (students.length === 0) {
      console.log('⚠️  No students found for this organization.')
      console.log('Please run user seed with students first: pnpm run seed:users <orgId>')
      return { enrollments: [], message: 'No students found' }
    }

    console.log(`✅ Found ${students.length} students`)

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

    // Check if enrollments already exist
    console.log('🔍 Checking existing enrollments...')
    const existingEnrollments = await db
      .select()
      .from(classroomSchema.classroomStudentEnrollment)
      .where(eq(classroomSchema.classroomStudentEnrollment.orgId, orgId))

    if (existingEnrollments.length > 0) {
      console.log(`⚠️  Found ${existingEnrollments.length} existing student enrollments for organization ${orgId}`)
      console.log('Skipping student enrollments seed to avoid duplicates.')
      return { enrollments: [], message: 'Student enrollments already exist' }
    }

    // Create enrollments - distribute students across classrooms
    console.log('📝 Creating student enrollments...')
    const createdEnrollments = []

    // Calculate students per classroom (roughly equal distribution)
    const studentsPerClassroom = Math.ceil(students.length / classrooms.length)
    let studentIndex = 0

    for (const classroom of classrooms) {
      console.log(`\n📍 Enrolling students in: ${classroom.name}`)

      // Determine how many students for this classroom
      const remainingStudents = students.length - studentIndex
      const studentsForThisClass = Math.min(studentsPerClassroom, remainingStudents)

      if (studentsForThisClass <= 0) {
        console.log(`  ⏭️  No more students to enroll`)
        break
      }

      // Add some randomness to enrollment - some classrooms might get more/fewer students
      const variance = Math.floor(Math.random() * 3) - 1 // -1, 0, or +1
      const actualStudentsForClass = Math.max(1, Math.min(studentsForThisClass + variance, remainingStudents))

      console.log(`  👥 Enrolling ${actualStudentsForClass} students`)

      for (let i = 0; i < actualStudentsForClass && studentIndex < students.length; i++) {
        const student = students[studentIndex]

        try {
          const [enrollment] = await db
            .insert(classroomSchema.classroomStudentEnrollment)
            .values({
              classroomId: classroom.id,
              studentId: student.id,
              status: 'active',
              orgId,
              enrollmentDate: new Date(),
            })
            .returning()

          createdEnrollments.push(enrollment)
          console.log(`    ✅ ${student.name} ${student.lastName} (${student.email})`)
          studentIndex++

        } catch (error) {
          // Skip if duplicate enrollment
          if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
            console.log(`    ⚠️  Skipping duplicate enrollment: ${student.name}`)
            studentIndex++
            continue
          }
          throw error
        }
      }
    }

    // Enroll any remaining students in the last classroom
    if (studentIndex < students.length) {
      const lastClassroom = classrooms[classrooms.length - 1]
      console.log(`\n📍 Enrolling remaining students in: ${lastClassroom.name}`)

      while (studentIndex < students.length) {
        const student = students[studentIndex]

        try {
          const [enrollment] = await db
            .insert(classroomSchema.classroomStudentEnrollment)
            .values({
              classroomId: lastClassroom.id,
              studentId: student.id,
              status: 'active',
              orgId,
              enrollmentDate: new Date(),
            })
            .returning()

          createdEnrollments.push(enrollment)
          console.log(`    ✅ ${student.name} ${student.lastName} (${student.email})`)
          studentIndex++

        } catch (error) {
          if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
            console.log(`    ⚠️  Skipping duplicate enrollment: ${student.name}`)
            studentIndex++
            continue
          }
          throw error
        }
      }
    }

    console.log('\n🎉 Student enrollments seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdEnrollments.length} student enrollments created`)
    console.log(`  - ${students.length} students distributed across ${classrooms.length} classrooms`)

    // Show enrollment distribution
    const enrollmentsByClassroom = new Map()
    for (const enrollment of createdEnrollments) {
      const classroom = classrooms.find(c => c.id === enrollment.classroomId)
      const count = enrollmentsByClassroom.get(classroom?.name || 'Unknown') || 0
      enrollmentsByClassroom.set(classroom?.name || 'Unknown', count + 1)
    }

    console.log('\n📊 Enrollment distribution:')
    for (const [classroomName, count] of enrollmentsByClassroom.entries()) {
      console.log(`  - ${classroomName}: ${count} students`)
    }

    return {
      enrollments: createdEnrollments,
      summary: {
        total: createdEnrollments.length,
        classrooms: classrooms.length,
        students: students.length,
        distribution: Object.fromEntries(enrollmentsByClassroom)
      }
    }

  } catch (error) {
    console.error('❌ Student enrollments seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:student-enrollments <orgId>')
  console.error('Example: pnpm run seed:student-enrollments org_default_school')
  process.exit(1)
}

// Run the seed
seedStudentEnrollments(orgId).catch((error) => {
  console.error('❌ Student enrollments seed process failed:', error)
  process.exit(1)
})
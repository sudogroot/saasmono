import { config } from 'dotenv'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'

config()
const { Pool } = pkg

async function seedGroupMemberships(orgId: string) {
  console.log(`👥 Starting group memberships seed for organization: ${orgId}\n`)

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

    // Get classroom groups
    console.log('👥 Fetching classroom groups...')
    const classroomGroups = await db
      .select({
        id: classroomSchema.classroomGroup.id,
        name: classroomSchema.classroomGroup.name,
        code: classroomSchema.classroomGroup.code,
        isDefault: classroomSchema.classroomGroup.isDefault,
        classroomId: classroomSchema.classroomGroup.classroomId,
        maxCapacity: classroomSchema.classroomGroup.maxCapacity,
        classroomName: classroomSchema.classroom.name,
      })
      .from(classroomSchema.classroomGroup)
      .innerJoin(classroomSchema.classroom, eq(classroomSchema.classroomGroup.classroomId, classroomSchema.classroom.id))
      .where(eq(classroomSchema.classroomGroup.orgId, orgId))

    if (classroomGroups.length === 0) {
      throw new Error(`No classroom groups found for organization ${orgId}. Please run classroom groups seed first.`)
    }

    console.log(`✅ Found ${classroomGroups.length} classroom groups`)

    // Get student enrollments
    console.log('🎓 Fetching student enrollments...')
    const enrollments = await db
      .select({
        studentId: classroomSchema.classroomStudentEnrollment.studentId,
        classroomId: classroomSchema.classroomStudentEnrollment.classroomId,
        studentName: authSchema.user.name,
        studentLastName: authSchema.user.lastName,
        classroomName: classroomSchema.classroom.name,
      })
      .from(classroomSchema.classroomStudentEnrollment)
      .innerJoin(authSchema.user, eq(classroomSchema.classroomStudentEnrollment.studentId, authSchema.user.id))
      .innerJoin(classroomSchema.classroom, eq(classroomSchema.classroomStudentEnrollment.classroomId, classroomSchema.classroom.id))
      .where(eq(classroomSchema.classroomStudentEnrollment.orgId, orgId))

    if (enrollments.length === 0) {
      throw new Error(`No student enrollments found for organization ${orgId}. Please run student enrollments seed first.`)
    }

    console.log(`✅ Found ${enrollments.length} student enrollments`)

    // Check if group memberships already exist
    console.log('🔍 Checking existing group memberships...')
    const existingMemberships = await db
      .select()
      .from(classroomSchema.classroomGroupMembership)
      .where(eq(classroomSchema.classroomGroupMembership.orgId, orgId))

    if (existingMemberships.length > 0) {
      console.log(`⚠️  Found ${existingMemberships.length} existing group memberships for organization ${orgId}`)
      console.log('Skipping group memberships seed to avoid duplicates.')
      return { memberships: [], message: 'Group memberships already exist' }
    }

    // Create group memberships
    console.log('📝 Creating group memberships...')
    const createdMemberships = []

    // Group enrollments by classroom
    const enrollmentsByClassroom = new Map()
    for (const enrollment of enrollments) {
      if (!enrollmentsByClassroom.has(enrollment.classroomId)) {
        enrollmentsByClassroom.set(enrollment.classroomId, [])
      }
      enrollmentsByClassroom.get(enrollment.classroomId).push(enrollment)
    }

    for (const [classroomId, classroomEnrollments] of enrollmentsByClassroom.entries()) {
      const classroomName = classroomEnrollments[0].classroomName
      console.log(`\n📍 Processing: ${classroomName} (${classroomEnrollments.length} students)`)

      // Get groups for this classroom
      const classroomGroupsForClass = classroomGroups.filter(g => g.classroomId === classroomId)
      const defaultGroup = classroomGroupsForClass.find(g => g.isDefault)
      const specializedGroups = classroomGroupsForClass.filter(g => !g.isDefault)

      // 1. Add ALL students to the default "All Students" group
      if (defaultGroup) {
        console.log(`  👥 Adding all students to default group: ${defaultGroup.name}`)
        for (const enrollment of classroomEnrollments) {
          try {
            const [membership] = await db
              .insert(classroomSchema.classroomGroupMembership)
              .values({
                classroomGroupId: defaultGroup.id,
                studentId: enrollment.studentId,
                isActive: true,
                orgId,
              })
              .returning()

            createdMemberships.push(membership)
          } catch (error) {
            if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
              console.log(`    ⚠️  Skipping duplicate membership for student in default group`)
              continue
            }
            throw error
          }
        }
        console.log(`    ✅ Added ${classroomEnrollments.length} students to ${defaultGroup.name}`)
      }

      // 2. Randomly distribute students to specialized groups
      console.log(`  🎯 Distributing students to specialized groups...`)

      // Shuffle students for random distribution
      const shuffledStudents = [...classroomEnrollments].sort(() => Math.random() - 0.5)

      // Calculate distribution weights for different group types
      const groupDistribution = {
        // Academic level groups (higher participation)
        'ADVANCED': 0.3,    // 30% of students
        'INTERMEDIATE': 0.4, // 40% of students
        'SUPPORT': 0.3,     // 30% of students
        'REMEDIAL': 0.2,    // 20% of students

        // Language groups (moderate participation)
        'FRENCH': 0.6,      // 60% take French
        'ENGLISH': 0.6,     // 60% take English

        // Lab groups (smaller, rotating groups)
        'LAB_A': 0.5,       // 50% in Lab A
        'LAB_B': 0.5,       // 50% in Lab B (some overlap possible)

        // Project and specialized groups (lower participation)
        'PROJECTS': 0.4,    // 40% in project groups
        'PHYSICS': 0.3,     // Science specific
        'CHEMISTRY': 0.3,   // Science specific
        'BIOLOGY': 0.3,     // Science specific
        'PROBLEM_SOLVING': 0.25, // Math specific
        'GEOMETRY': 0.25,   // Math specific
        'LIT_DISCUSSION': 0.35,  // Literature specific
        'CREATIVE_WRITING': 0.25, // Literature specific
      }

      for (const group of specializedGroups) {
        // Determine group type from code
        const groupType = group.code.split('_').slice(-1)[0] // Get last part of code
        const participationRate = groupDistribution[groupType] || 0.3 // Default 30%

        // Calculate how many students for this group
        const maxStudents = group.maxCapacity || Math.ceil(classroomEnrollments.length * participationRate)
        const numStudents = Math.min(
          Math.floor(classroomEnrollments.length * participationRate),
          maxStudents,
          shuffledStudents.length
        )

        if (numStudents > 0) {
          console.log(`    📚 ${group.name}: selecting ${numStudents} students`)

          // Select students for this group
          const selectedStudents = shuffledStudents.slice(0, numStudents)

          for (const enrollment of selectedStudents) {
            try {
              const [membership] = await db
                .insert(classroomSchema.classroomGroupMembership)
                .values({
                  classroomGroupId: group.id,
                  studentId: enrollment.studentId,
                  isActive: true,
                  orgId,
                })
                .returning()

              createdMemberships.push(membership)
            } catch (error) {
              if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
                continue
              }
              throw error
            }
          }

          console.log(`      ✅ Added ${numStudents} students to ${group.name}`)
        }
      }
    }

    console.log('\n🎉 Group memberships seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdMemberships.length} group memberships created`)
    console.log(`  - ${enrollments.length} students distributed across groups`)
    console.log(`  - ${classroomGroups.length} total groups available`)

    // Show membership distribution by classroom
    const membershipsByClassroom = new Map()
    for (const membership of createdMemberships) {
      const group = classroomGroups.find(g => g.id === membership.classroomGroupId)
      const classroomName = group?.classroomName || 'Unknown'

      if (!membershipsByClassroom.has(classroomName)) {
        membershipsByClassroom.set(classroomName, 0)
      }
      membershipsByClassroom.set(classroomName, membershipsByClassroom.get(classroomName) + 1)
    }

    console.log('\n📊 Membership distribution by classroom:')
    for (const [classroomName, count] of membershipsByClassroom.entries()) {
      console.log(`  - ${classroomName}: ${count} total memberships`)
    }

    return {
      memberships: createdMemberships,
      summary: {
        total: createdMemberships.length,
        students: enrollments.length,
        groups: classroomGroups.length,
        classrooms: enrollmentsByClassroom.size,
        distribution: Object.fromEntries(membershipsByClassroom)
      }
    }

  } catch (error) {
    console.error('❌ Group memberships seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:group-memberships <orgId>')
  console.error('Example: pnpm run seed:group-memberships org_default_school')
  process.exit(1)
}

// Run the seed
seedGroupMemberships(orgId).catch((error) => {
  console.error('❌ Group memberships seed process failed:', error)
  process.exit(1)
})
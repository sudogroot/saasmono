import { config } from 'dotenv'
import { and, eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as attendanceSchema from '../../schema/attendance'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'
import * as timetableSchema from '../../schema/timetable'

config()
const { Pool } = pkg

// Attendance status distribution (realistic percentages)
const STATUS_WEIGHTS = {
  PRESENT: 0.85,  // 85% usually present
  ABSENT: 0.05,   // 5% absent
  LATE: 0.06,     // 6% late
  EXCUSED: 0.03,  // 3% excused
  SICK: 0.01,     // 1% sick
}

// Sample notes for different statuses
const STATUS_NOTES = {
  ABSENT: [
    'غائب بدون عذر',
    'لم يحضر',
    'غياب غير مبرر',
    null, // Some absences without notes
  ],
  LATE: [
    'تأخر 10 دقائق',
    'تأخر 15 دقيقة',
    'تأخر بسبب المواصلات',
    'وصل متأخراً',
    null,
  ],
  EXCUSED: [
    'عذر طبي',
    'ظروف عائلية',
    'موعد طبي',
    'إذن من الإدارة',
  ],
  SICK: [
    'مريض - حمى',
    'إنفلونزا',
    'عدم الشعور بالراحة',
    'مرض مفاجئ',
  ],
}

// General notes templates for attendance sessions
const GENERAL_NOTES_TEMPLATES = [
  'حصة عادية، حضور جيد بشكل عام',
  'بعض التأخيرات بسبب سوء الأحوال الجوية',
  'حضور ممتاز، جميع الطلاب في الوقت المحدد',
  'عدة غيابات بسبب الإنفلونزا الموسمية',
  'حضور جيد، لاحظت تحسناً في الانضباط',
  null, // Some sessions without general notes
  null,
  null,
]

function getRandomStatus(): 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK' {
  const rand = Math.random()
  let cumulative = 0

  for (const [status, weight] of Object.entries(STATUS_WEIGHTS)) {
    cumulative += weight
    if (rand <= cumulative) {
      return status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK'
    }
  }

  return 'PRESENT' // Fallback
}

function getRandomNote(status: 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK'): string | null {
  const notes = STATUS_NOTES[status]
  const note = notes[Math.floor(Math.random() * notes.length)]
  return note || null
}

async function seedAttendances(orgId: string) {
  console.log(`✅ Starting attendances seed for organization: ${orgId}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, {
    schema: {
      ...attendanceSchema,
      ...timetableSchema,
      ...classroomSchema,
      ...authSchema,
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

    // Check if attendance sessions already exist
    console.log('🔍 Checking existing attendance sessions...')
    const existingSessions = await db
      .select()
      .from(attendanceSchema.attendanceSession)
      .where(eq(attendanceSchema.attendanceSession.orgId, orgId))

    if (existingSessions.length > 0) {
      console.log(`⚠️  Found ${existingSessions.length} existing attendance sessions for organization ${orgId}`)
      console.log('Skipping attendances seed to avoid duplicates.')
      return { sessions: [], attendances: [], message: 'Attendance sessions already exist' }
    }

    // Get timetables with their classroom/group info
    console.log('📅 Fetching timetables...')
    const timetables = await db
      .select({
        id: timetableSchema.timetable.id,
        title: timetableSchema.timetable.title,
        startDateTime: timetableSchema.timetable.startDateTime,
        endDateTime: timetableSchema.timetable.endDateTime,
        teacherId: timetableSchema.timetable.teacherId,
        classroomId: timetableSchema.timetable.classroomId,
        classroomGroupId: timetableSchema.timetable.classroomGroupId,
      })
      .from(timetableSchema.timetable)
      .where(
        and(
          eq(timetableSchema.timetable.orgId, orgId),
          isNull(timetableSchema.timetable.deletedAt)
        )
      )

    if (timetables.length === 0) {
      throw new Error(`No timetables found for organization ${orgId}. Please run timetables seed first.`)
    }

    console.log(`✅ Found ${timetables.length} timetables`)

    // Get all student enrollments (for classroom-based timetables)
    console.log('🎓 Fetching student enrollments...')
    const enrollments = await db
      .select({
        studentId: classroomSchema.classroomStudentEnrollment.studentId,
        classroomId: classroomSchema.classroomStudentEnrollment.classroomId,
      })
      .from(classroomSchema.classroomStudentEnrollment)
      .where(eq(classroomSchema.classroomStudentEnrollment.orgId, orgId))

    console.log(`✅ Found ${enrollments.length} student enrollments`)

    // Get all group memberships (for group-based timetables)
    console.log('👥 Fetching group memberships...')
    const groupMemberships = await db
      .select({
        studentId: classroomSchema.classroomGroupMembership.studentId,
        groupId: classroomSchema.classroomGroupMembership.classroomGroupId,
      })
      .from(classroomSchema.classroomGroupMembership)
      .where(
        and(
          eq(classroomSchema.classroomGroupMembership.orgId, orgId),
          eq(classroomSchema.classroomGroupMembership.isActive, true)
        )
      )

    console.log(`✅ Found ${groupMemberships.length} group memberships`)

    // Create maps for quick lookup
    const enrollmentsByClassroom = new Map<string, string[]>()
    for (const enrollment of enrollments) {
      if (!enrollmentsByClassroom.has(enrollment.classroomId)) {
        enrollmentsByClassroom.set(enrollment.classroomId, [])
      }
      enrollmentsByClassroom.get(enrollment.classroomId)!.push(enrollment.studentId)
    }

    const membershipsByGroup = new Map<string, string[]>()
    for (const membership of groupMemberships) {
      if (!membershipsByGroup.has(membership.groupId)) {
        membershipsByGroup.set(membership.groupId, [])
      }
      membershipsByGroup.get(membership.groupId)!.push(membership.studentId)
    }

    // Create attendance sessions
    console.log('📝 Creating attendance sessions...')
    const createdSessions = []
    const createdAttendances = []

    // Create attendance for 70% of timetables
    const timetablesToUse = timetables
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.ceil(timetables.length * 0.7))

    for (const timetable of timetablesToUse) {
      // Get students for this timetable
      let students: string[] = []

      if (timetable.classroomId) {
        students = enrollmentsByClassroom.get(timetable.classroomId) || []
      } else if (timetable.classroomGroupId) {
        students = membershipsByGroup.get(timetable.classroomGroupId) || []
      }

      if (students.length === 0) {
        console.log(`  ⚠️  No students found for timetable: ${timetable.title}`)
        continue
      }

      // Pick a random general note
      const generalNotes = GENERAL_NOTES_TEMPLATES[Math.floor(Math.random() * GENERAL_NOTES_TEMPLATES.length)] || null

      try {
        // Create attendance session
        const [session] = await db
          .insert(attendanceSchema.attendanceSession)
          .values({
            timetableId: timetable.id,
            generalNotes,
            orgId,
            createdByUserId: timetable.teacherId,
          })
          .returning()

        if (!session) throw new Error(`Failed to create attendance session`)
        createdSessions.push(session)

        // Create individual attendance records for each student
        const sessionAttendances = []
        for (const studentId of students) {
          const status = getRandomStatus()
          const note = status === 'PRESENT' ? null : getRandomNote(status as any)

          // For late students, add arrival time
          const arrivedAt = status === 'LATE'
            ? new Date(new Date(timetable.startDateTime).getTime() + Math.random() * 20 * 60000) // 0-20 minutes late
            : null

          const [attendance] = await db
            .insert(attendanceSchema.attendance)
            .values({
              status,
              note,
              attendanceSessionId: session.id,
              studentId,
              timetableId: timetable.id,
              orgId,
              arrivedAt,
              createdByUserId: timetable.teacherId,
            })
            .returning()

          if (!attendance) throw new Error(`Failed to create attendance record`)
          sessionAttendances.push(attendance)
          createdAttendances.push(attendance)
        }

        // Calculate stats for this session
        const stats = {
          present: sessionAttendances.filter(a => a.status === 'PRESENT').length,
          absent: sessionAttendances.filter(a => a.status === 'ABSENT').length,
          late: sessionAttendances.filter(a => a.status === 'LATE').length,
          excused: sessionAttendances.filter(a => a.status === 'EXCUSED').length,
          sick: sessionAttendances.filter(a => a.status === 'SICK').length,
        }

        console.log(`  ✅ ${timetable.title}`)
        console.log(`     Total: ${students.length} | ✓ ${stats.present} | ✗ ${stats.absent} | ⏰ ${stats.late} | 📋 ${stats.excused} | 🤒 ${stats.sick}`)

      } catch (error) {
        if ((error as Error).message?.includes('duplicate') || (error as Error).message?.includes('unique')) {
          console.log(`    ⚠️  Skipping duplicate session for timetable: ${timetable.title}`)
          continue
        }
        throw error
      }
    }

    console.log('\n🎉 Attendances seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdSessions.length} attendance sessions created`)
    console.log(`  - ${createdAttendances.length} individual attendance records created`)
    console.log(`  - ${timetables.length} total timetables available`)
    console.log(`  - ${Math.ceil((createdSessions.length / timetables.length) * 100)}% timetables coverage`)

    // Calculate overall statistics
    const overallStats = {
      present: createdAttendances.filter(a => a.status === 'PRESENT').length,
      absent: createdAttendances.filter(a => a.status === 'ABSENT').length,
      late: createdAttendances.filter(a => a.status === 'LATE').length,
      excused: createdAttendances.filter(a => a.status === 'EXCUSED').length,
      sick: createdAttendances.filter(a => a.status === 'SICK').length,
    }

    console.log('\n📊 Overall attendance statistics:')
    console.log(`  - Present: ${overallStats.present} (${Math.round((overallStats.present / createdAttendances.length) * 100)}%)`)
    console.log(`  - Absent: ${overallStats.absent} (${Math.round((overallStats.absent / createdAttendances.length) * 100)}%)`)
    console.log(`  - Late: ${overallStats.late} (${Math.round((overallStats.late / createdAttendances.length) * 100)}%)`)
    console.log(`  - Excused: ${overallStats.excused} (${Math.round((overallStats.excused / createdAttendances.length) * 100)}%)`)
    console.log(`  - Sick: ${overallStats.sick} (${Math.round((overallStats.sick / createdAttendances.length) * 100)}%)`)

    // Sessions with notes
    const sessionsWithNotes = createdSessions.filter(s => s.generalNotes).length
    console.log('\n📊 Sessions with general notes:')
    console.log(`  - ${sessionsWithNotes} out of ${createdSessions.length} sessions (${Math.round((sessionsWithNotes / createdSessions.length) * 100)}%)`)

    return {
      sessions: createdSessions,
      attendances: createdAttendances,
      summary: {
        totalSessions: createdSessions.length,
        totalAttendances: createdAttendances.length,
        timetables: timetables.length,
        coverage: Math.ceil((createdSessions.length / timetables.length) * 100),
        stats: overallStats,
        sessionsWithNotes,
      }
    }

  } catch (error) {
    console.error('❌ Attendances seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:attendances <orgId>')
  console.error('Example: pnpm run seed:attendances org_default_school')
  process.exit(1)
}

// Run the seed
seedAttendances(orgId).catch((error) => {
  console.error('❌ Attendances seed process failed:', error)
  process.exit(1)
})

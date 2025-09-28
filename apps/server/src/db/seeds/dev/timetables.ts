import { config } from 'dotenv'
import { and, eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'
import * as educationSchema from '../../schema/education'
import * as roomSchema from '../../schema/room'
import * as timetableSchema from '../../schema/timetable'

config()
const { Pool } = pkg

// Sample rooms data
const ROOMS_DATA = [
  { name: 'قاعة الرياضيات 1', code: 'MATH-1', capacity: 35, location: 'الطابق الأول', type: 'classroom' },
  { name: 'قاعة الرياضيات 2', code: 'MATH-2', capacity: 35, location: 'الطابق الأول', type: 'classroom' },
  { name: 'مختبر الفيزياء', code: 'PHY-LAB', capacity: 25, location: 'الطابق الثاني', type: 'laboratory' },
  { name: 'مختبر الكيمياء', code: 'CHEM-LAB', capacity: 25, location: 'الطابق الثاني', type: 'laboratory' },
  { name: 'مختبر البيولوجيا', code: 'BIO-LAB', capacity: 25, location: 'الطابق الثاني', type: 'laboratory' },
  { name: 'قاعة اللغة العربية 1', code: 'AR-1', capacity: 40, location: 'الطابق الأرضي', type: 'classroom' },
  { name: 'قاعة اللغة العربية 2', code: 'AR-2', capacity: 40, location: 'الطابق الأرضي', type: 'classroom' },
  { name: 'قاعة اللغة الفرنسية', code: 'FR-1', capacity: 30, location: 'الطابق الأول', type: 'classroom' },
  { name: 'قاعة اللغة الإنجليزية', code: 'EN-1', capacity: 30, location: 'الطابق الأول', type: 'classroom' },
  { name: 'قاعة التاريخ والجغرافيا', code: 'HIST-1', capacity: 35, location: 'الطابق الثاني', type: 'classroom' },
  { name: 'قاعة الفلسفة', code: 'PHIL-1', capacity: 35, location: 'الطابق الثاني', type: 'classroom' },
  { name: 'ملعب كرة القدم', code: 'SPORT-1', capacity: 50, location: 'الساحة الخارجية', type: 'sports' },
  { name: 'صالة الرياضة', code: 'GYM-1', capacity: 40, location: 'المبنى الرياضي', type: 'sports' },
  { name: 'قاعة المحاضرات الكبرى', code: 'HALL-1', capacity: 100, location: 'الطابق الأرضي', type: 'auditorium' },
  { name: 'مكتبة المدرسة', code: 'LIB-1', capacity: 50, location: 'الطابق الثالث', type: 'library' },
]

// Weekly timetable structure - Arabic days starting from Sunday
const WEEKDAYS = [
  { name: 'الأحد', key: 'sunday', dayNumber: 0 },
  { name: 'الاثنين', key: 'monday', dayNumber: 1 },
  { name: 'الثلاثاء', key: 'tuesday', dayNumber: 2 },
  { name: 'الأربعاء', key: 'wednesday', dayNumber: 3 },
  { name: 'الخميس', key: 'thursday', dayNumber: 4 },
]

// Time slots from 7 AM to 7 PM (12 hours)
const TIME_SLOTS = [
  { start: 7, end: 8, label: '07:00 - 08:00' },
  { start: 8, end: 9, label: '08:00 - 09:00' },
  { start: 9, end: 10, label: '09:00 - 10:00' },
  { start: 10, end: 11, label: '10:00 - 11:00' },
  { start: 11, end: 12, label: '11:00 - 12:00' },
  { start: 12, end: 13, label: '12:00 - 13:00' },
  { start: 13, end: 14, label: '13:00 - 14:00' },
  { start: 14, end: 15, label: '14:00 - 15:00' },
  { start: 15, end: 16, label: '15:00 - 16:00' },
  { start: 16, end: 17, label: '16:00 - 17:00' },
  { start: 17, end: 18, label: '17:00 - 18:00' },
  { start: 18, end: 19, label: '18:00 - 19:00' },
]

// Subject to room mapping preferences
const SUBJECT_ROOM_PREFERENCES = {
  'الرياضيات': ['MATH-1', 'MATH-2'],
  'العلوم الفيزيائية': ['PHY-LAB', 'MATH-1'],
  'علوم الطبيعة والحياة': ['BIO-LAB', 'CHEM-LAB'],
  'اللغة العربية وآدابها': ['AR-1', 'AR-2'],
  'اللغة الفرنسية': ['FR-1'],
  'اللغة الإنجليزية': ['EN-1'],
  'التاريخ والجغرافيا': ['HIST-1'],
  'الفلسفة': ['PHIL-1'],
  'التربية البدنية والرياضية': ['SPORT-1', 'GYM-1'],
  'التربية الإسلامية': ['AR-1', 'AR-2'],
  'التربية الفنية': ['AR-1', 'AR-2'],
  'الأمازيغية': ['FR-1'],
}

async function seedTimetables(orgId: string) {
  console.log(`📅 Starting timetable seed for organization: ${orgId}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, {
    schema: {
      ...timetableSchema,
      ...roomSchema,
      ...classroomSchema,
      ...educationSchema,
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

    // Check if timetables already exist
    console.log('🔍 Checking existing timetables...')
    const existingTimetables = await db
      .select()
      .from(timetableSchema.timetable)
      .where(eq(timetableSchema.timetable.orgId, orgId))

    if (existingTimetables.length > 0) {
      console.log(`⚠️  Found ${existingTimetables.length} existing timetables for organization ${orgId}`)
      console.log('Skipping timetable seed to avoid duplicates.')
      return { timetables: [], rooms: [], message: 'Timetables already exist' }
    }

    // Create or get rooms first
    console.log('🏢 Creating/checking rooms...')
    const createdRooms = []
    const existingRooms = await db
      .select()
      .from(roomSchema.room)
      .where(eq(roomSchema.room.orgId, orgId))

    if (existingRooms.length === 0) {
      console.log('🏗️  Creating rooms...')
      for (const roomData of ROOMS_DATA) {
        const [room] = await db
          .insert(roomSchema.room)
          .values({
            name: roomData.name,
            code: roomData.code,
            capacity: roomData.capacity,
            location: roomData.location,
            description: `${roomData.type} - ${roomData.location}`,
            orgId,
          })
          .returning()

        if (!room) throw new Error(`Failed to create room: ${roomData.name}`)
        createdRooms.push(room)
        console.log(`  ✅ Created room: ${room.name} (${room.code})`)
      }
    } else {
      console.log(`✅ Using ${existingRooms.length} existing rooms`)
      createdRooms.push(...existingRooms)
    }

    // Get all required data
    console.log('📚 Fetching classrooms, teachers, and subjects...')

    const classrooms = await db
      .select()
      .from(classroomSchema.classroom)
      .where(eq(classroomSchema.classroom.orgId, orgId))

    if (classrooms.length === 0) {
      throw new Error(`No classrooms found for organization ${orgId}. Please run classroom seed first.`)
    }

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
      throw new Error(`No teachers found for organization ${orgId}. Please run user seed with teachers first.`)
    }

    const educationSubjects = await db
      .select()
      .from(educationSchema.educationSubject)
      .where(eq(educationSchema.educationSubject.orgId, orgId))

    if (educationSubjects.length === 0) {
      throw new Error(`No education subjects found for organization ${orgId}. Please run education seed first.`)
    }

    console.log(`✅ Found ${classrooms.length} classrooms, ${teachers.length} teachers, ${educationSubjects.length} subjects`)

    // Get teacher assignments for realistic scheduling
    const teacherAssignments = await db
      .select({
        teacherId: classroomSchema.classroomTeacherAssignment.teacherId,
        classroomId: classroomSchema.classroomTeacherAssignment.classroomId,
        educationSubjectId: classroomSchema.classroomTeacherAssignment.educationSubjectId,
        isMainTeacher: classroomSchema.classroomTeacherAssignment.isMainTeacher,
      })
      .from(classroomSchema.classroomTeacherAssignment)
      .where(
        and(
          eq(classroomSchema.classroomTeacherAssignment.orgId, orgId),
          isNull(classroomSchema.classroomTeacherAssignment.deletedAt)
        )
      )

    console.log(`✅ Found ${teacherAssignments.length} teacher assignments`)

    // Create room lookup map
    const roomMap = new Map()
    createdRooms.forEach(room => {
      roomMap.set(room.code, room.id)
    })

    // Create subject lookup map
    const subjectMap = new Map()
    educationSubjects.forEach(subject => {
      subjectMap.set(subject.name, subject.id)
    })

    // Generate timetables
    console.log('📅 Creating timetable sessions...')
    const createdTimetables = []

    // Get current week's Monday as reference
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1) // Get this week's Monday

    for (const assignment of teacherAssignments) {
      // Find subject and classroom
      const subject = educationSubjects.find(s => s.id === assignment.educationSubjectId)
      const classroom = classrooms.find(c => c.id === assignment.classroomId)

      if (!subject || !classroom) continue

      // Get preferred rooms for this subject
      const preferredRoomCodes = SUBJECT_ROOM_PREFERENCES[subject.name] || ['MATH-1']
      const availableRoomIds = preferredRoomCodes
        .map(code => roomMap.get(code))
        .filter(Boolean)

      if (availableRoomIds.length === 0) {
        console.log(`⚠️  No suitable room found for subject: ${subject.name}`)
        continue
      }

      // Create 2-3 sessions per week for each assignment
      const sessionsPerWeek = subject.name === 'الرياضيات' ? 3 :
                             subject.name === 'العلوم الفيزيائية' ? 3 :
                             subject.name === 'اللغة العربية وآدابها' ? 3 : 2

      const usedSlots = new Set() // Track used day-time combinations for this class

      for (let sessionCount = 0; sessionCount < sessionsPerWeek; sessionCount++) {
        // Pick a random day and time that hasn't been used
        let attempts = 0
        let dayIndex, timeSlotIndex, slotKey

        do {
          dayIndex = Math.floor(Math.random() * WEEKDAYS.length)
          timeSlotIndex = Math.floor(Math.random() * TIME_SLOTS.length)
          slotKey = `${dayIndex}-${timeSlotIndex}`
          attempts++

          if (attempts > 20) break // Avoid infinite loop
        } while (usedSlots.has(slotKey))

        if (attempts > 20) continue // Skip if can't find available slot

        usedSlots.add(slotKey)

        const weekday = WEEKDAYS[dayIndex]!
        const timeSlot = TIME_SLOTS[timeSlotIndex]!

        // Calculate session date and time
        const sessionDate = new Date(monday)
        sessionDate.setDate(monday.getDate() + weekday.dayNumber)

        const startDateTime = new Date(sessionDate)
        startDateTime.setHours(timeSlot.start, 0, 0, 0)

        const endDateTime = new Date(sessionDate)
        endDateTime.setHours(timeSlot.end, 0, 0, 0)

        // Pick a random room from available ones
        const randomRoomId = availableRoomIds[Math.floor(Math.random() * availableRoomIds.length)]!

        try {
          const [timetableSession] = await db
            .insert(timetableSchema.timetable)
            .values({
              title: `${subject.name} - ${classroom.name}`,
              startDateTime,
              endDateTime,
              status: 'SCHEDULED',
              classroomId: assignment.classroomId,
              teacherId: assignment.teacherId,
              educationSubjectId: assignment.educationSubjectId,
              roomId: randomRoomId,
              orgId,
              notes: `حصة ${subject.name} للفصل ${classroom.name}`,
            })
            .returning()

          if (!timetableSession) throw new Error(`Failed to create timetable session`)
          createdTimetables.push(timetableSession)

          const teacher = teachers.find(t => t.id === assignment.teacherId)
          console.log(`  ✅ ${weekday.name} ${timeSlot.label}: ${subject.name} - ${classroom.name} (${teacher?.name || 'Unknown'})`)

        } catch (error) {
          // Skip on conflict (duplicate session)
          if ((error as Error).message?.includes('duplicate') || (error as Error).message?.includes('unique')) {
            console.log(`    ⚠️  Skipping duplicate session: ${subject.name} - ${classroom.name}`)
            continue
          }
          throw error
        }
      }
    }

    console.log('\n🎉 Timetable seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdRooms.length} rooms created/verified`)
    console.log(`  - ${createdTimetables.length} timetable sessions created`)
    console.log(`  - ${classrooms.length} classrooms with schedules`)
    console.log(`  - ${teachers.length} teachers assigned`)

    // Show sessions per day
    const sessionsByDay = new Map()
    createdTimetables.forEach(session => {
      const day = new Date(session.startDateTime).getDay()
      const dayName = WEEKDAYS.find(d => d.dayNumber === day)?.name || 'غير معروف'
      sessionsByDay.set(dayName, (sessionsByDay.get(dayName) || 0) + 1)
    })

    console.log('\n📊 Sessions distribution by day:')
    for (const [day, count] of sessionsByDay.entries()) {
      console.log(`  - ${day}: ${count} sessions`)
    }

    return {
      timetables: createdTimetables,
      rooms: createdRooms,
      summary: {
        totalSessions: createdTimetables.length,
        totalRooms: createdRooms.length,
        classrooms: classrooms.length,
        teachers: teachers.length,
        sessionsByDay: Object.fromEntries(sessionsByDay)
      }
    }

  } catch (error) {
    console.error('❌ Timetable seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:timetables <orgId>')
  console.error('Example: pnpm run seed:timetables org_default_school')
  process.exit(1)
}

// Run the seed
seedTimetables(orgId).catch((error) => {
  console.error('❌ Timetable seed process failed:', error)
  process.exit(1)
})
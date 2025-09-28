import { user } from '@/db/schema/auth'
import { attendance } from '@/db/schema/attendance'
import { classroom, classroomStudentEnrollment } from '@/db/schema/classroom'
import { educationSubject } from '@/db/schema/education'
import { timetable } from '@/db/schema/timetable'
import type {
  AttendanceListItem,
  AttendanceQuery,
  AttendanceSummary,
  CreateAttendanceInput,
  CreateBulkAttendanceInput,
  StudentAttendanceSummary,
  UpdateAttendanceInput
} from '@/types/attendance'
import { and, count, eq, gte, isNull, lte, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class AttendanceManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getAttendancesList(orgId: string, query?: AttendanceQuery) {
    let whereConditions = [eq(attendance.orgId, orgId), isNull(attendance.deletedAt)]

    // Add query filters
    if (query?.timetableId) {
      whereConditions.push(eq(attendance.timetableId, query.timetableId))
    }
    if (query?.studentId) {
      whereConditions.push(eq(attendance.studentId, query.studentId))
    }
    if (query?.status) {
      whereConditions.push(eq(attendance.status, query.status))
    }
    if (query?.startDate) {
      whereConditions.push(gte(timetable.startDateTime, query.startDate))
    }
    if (query?.endDate) {
      whereConditions.push(lte(timetable.startDateTime, query.endDate))
    }
    if (query?.classroomId) {
      whereConditions.push(eq(timetable.classroomId, query.classroomId))
    }
    if (query?.educationSubjectId) {
      whereConditions.push(eq(timetable.educationSubjectId, query.educationSubjectId))
    }

    const results = await this.db
      .select({
        attendanceId: attendance.id,
        attendanceStatus: attendance.status,
        attendanceNote: attendance.note,
        attendanceStudentId: attendance.studentId,
        attendanceTimetableId: attendance.timetableId,
        attendanceMarkedAt: attendance.markedAt,
        attendanceArrivedAt: attendance.arrivedAt,
        // Student data
        studentId: user.id,
        studentName: user.name,
        studentLastName: user.lastName,
        // Session instance data
        sessionId: timetable.id,
        sessionTitle: timetable.title,
        sessionStartDateTime: timetable.startDateTime,
      })
      .from(attendance)
      .leftJoin(user, eq(attendance.studentId, user.id))
      .leftJoin(timetable, eq(attendance.timetableId, timetable.id))
      .where(and(...whereConditions))

    return results.map((row) => ({
      id: row.attendanceId,
      status: row.attendanceStatus,
      note: row.attendanceNote,
      studentId: row.attendanceStudentId,
      timetableId: row.attendanceTimetableId,
      markedAt: row.attendanceMarkedAt,
      arrivedAt: row.attendanceArrivedAt,
      student: {
        id: row.studentId!,
        name: row.studentName!,
        lastName: row.studentLastName!,
      },
      timetable: {
        id: row.sessionId!,
        title: row.sessionTitle!,
        startDateTime: row.sessionStartDateTime!,
      },
    })) as AttendanceListItem[]
  }

  async getAttendanceById(attendanceId: string, orgId: string) {
    const result = await this.db
      .select({
        attendanceId: attendance.id,
        attendanceStatus: attendance.status,
        attendanceNote: attendance.note,
        attendanceStudentId: attendance.studentId,
        attendanceTimetableId: attendance.timetableId,
        attendanceOrgId: attendance.orgId,
        attendanceMarkedAt: attendance.markedAt,
        attendanceArrivedAt: attendance.arrivedAt,
        attendanceCreatedAt: attendance.createdAt,
        attendanceUpdatedAt: attendance.updatedAt,
        attendanceDeletedAt: attendance.deletedAt,
        // Student data
        studentId: user.id,
        studentName: user.name,
        studentLastName: user.lastName,
        studentEmail: user.email,
        // Session instance data
        sessionId: timetable.id,
        sessionTitle: timetable.title,
        sessionStartDateTime: timetable.startDateTime,
        sessionEndDateTime: timetable.endDateTime,
      })
      .from(attendance)
      .leftJoin(user, eq(attendance.studentId, user.id))
      .leftJoin(timetable, eq(attendance.timetableId, timetable.id))
      .where(and(
        eq(attendance.id, attendanceId),
        eq(attendance.orgId, orgId),
        isNull(attendance.deletedAt)
      ))

    if (!result[0] || result.length === 0) {
      throw new Error('Attendance record not found')
    }

    const row = result[0]

    return {
      id: row.attendanceId,
      status: row.attendanceStatus,
      note: row.attendanceNote,
      studentId: row.attendanceStudentId,
      timetableId: row.attendanceTimetableId,
      orgId: row.attendanceOrgId,
      markedAt: row.attendanceMarkedAt,
      arrivedAt: row.attendanceArrivedAt,
      createdAt: row.attendanceCreatedAt,
      updatedAt: row.attendanceUpdatedAt,
      deletedAt: row.attendanceDeletedAt,
      student: {
        id: row.studentId!,
        name: row.studentName!,
        lastName: row.studentLastName!,
        email: row.studentEmail!,
      },
      timetable: {
        id: row.sessionId!,
        title: row.sessionTitle!,
        startDateTime: row.sessionStartDateTime!,
        endDateTime: row.sessionEndDateTime!,
      },
    }
  }

  async createAttendance(input: CreateAttendanceInput, orgId: string, userId: string) {
    // Check if attendance already exists for this student and session
    const existingAttendance = await this.db
      .select({ id: attendance.id })
      .from(attendance)
      .where(and(
        eq(attendance.studentId, input.studentId),
        eq(attendance.timetableId, input.timetableId),
        eq(attendance.orgId, orgId),
        isNull(attendance.deletedAt)
      ))

    if (existingAttendance.length > 0) {
      throw new Error('Attendance already exists for this student and session')
    }

    const result = await this.db
      .insert(attendance)
      .values({
        status: input.status,
        note: input.note || null,
        studentId: input.studentId,
        timetableId: input.timetableId,
        arrivedAt: input.arrivedAt || null,
        orgId,
        createdByUserId: userId,
      })
      .returning({
        id: attendance.id,
        status: attendance.status,
        note: attendance.note,
        studentId: attendance.studentId,
        timetableId: attendance.timetableId,
        orgId: attendance.orgId,
        markedAt: attendance.markedAt,
        arrivedAt: attendance.arrivedAt,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
        deletedAt: attendance.deletedAt,
      })

    if (!result[0]) {
      throw new Error('Failed to create attendance record')
    }

    return result[0]
  }

  async createBulkAttendance(input: CreateBulkAttendanceInput, orgId: string, userId: string) {
    // Check for existing attendance records
    const studentIds = input.attendances.map(a => a.studentId)
    const existingAttendances = await this.db
      .select({
        studentId: attendance.studentId,
        timetableId: attendance.timetableId
      })
      .from(attendance)
      .where(and(
        eq(attendance.timetableId, input.timetableId),
        eq(attendance.orgId, orgId),
        isNull(attendance.deletedAt)
      ))

    const existingMap = new Set(existingAttendances.map(a => a.studentId))
    const newAttendances = input.attendances.filter(a => !existingMap.has(a.studentId))

    if (newAttendances.length === 0) {
      throw new Error('All students already have attendance recorded for this session')
    }

    const attendanceRecords = newAttendances.map(a => ({
      status: a.status,
      note: a.note || null,
      studentId: a.studentId,
      timetableId: input.timetableId,
      arrivedAt: a.arrivedAt || null,
      orgId,
      createdByUserId: userId,
    }))

    const result = await this.db
      .insert(attendance)
      .values(attendanceRecords)
      .returning({
        id: attendance.id,
        status: attendance.status,
        studentId: attendance.studentId,
        timetableId: attendance.timetableId,
      })

    return {
      created: result.length,
      skipped: input.attendances.length - result.length,
      records: result,
    }
  }

  async updateAttendance(attendanceId: string, input: UpdateAttendanceInput, orgId: string, userId: string) {
    const result = await this.db
      .update(attendance)
      .set({
        ...input,
        updatedByUserId: userId,
      })
      .where(and(
        eq(attendance.id, attendanceId),
        eq(attendance.orgId, orgId),
        isNull(attendance.deletedAt)
      ))
      .returning({
        id: attendance.id,
        status: attendance.status,
        note: attendance.note,
        studentId: attendance.studentId,
        timetableId: attendance.timetableId,
        orgId: attendance.orgId,
        markedAt: attendance.markedAt,
        arrivedAt: attendance.arrivedAt,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
        deletedAt: attendance.deletedAt,
      })

    if (!result[0] || result.length === 0) {
      throw new Error('Attendance record not found or failed to update')
    }

    return result[0]
  }

  async deleteAttendance(attendanceId: string, orgId: string, userId: string) {
    const result = await this.db
      .update(attendance)
      .set({
        deletedAt: new Date(),
        deletedByUserId: userId,
      })
      .where(and(
        eq(attendance.id, attendanceId),
        eq(attendance.orgId, orgId),
        isNull(attendance.deletedAt)
      ))
      .returning({ id: attendance.id })

    if (!result[0] || result.length === 0) {
      throw new Error('Attendance record not found or failed to delete')
    }

    return { success: true }
  }

  async getSessionAttendanceSummary(timetableId: string, orgId: string): Promise<AttendanceSummary> {
    // Get session info and total enrolled students
    const sessionInfo = await this.db
      .select({
        sessionId: timetable.id,
        sessionTitle: timetable.title,
        sessionStartDateTime: timetable.startDateTime,
        classroomId: timetable.classroomId,
      })
      .from(timetable)
      .where(and(
        eq(timetable.id, timetableId),
        eq(timetable.orgId, orgId),
        isNull(timetable.deletedAt)
      ))

    if (!sessionInfo[0]) {
      throw new Error('Session not found')
    }

    // Get attendance counts
    const attendanceCounts = await this.db
      .select({
        status: attendance.status,
        count: count(attendance.id),
      })
      .from(attendance)
      .where(and(
        eq(attendance.timetableId, timetableId),
        eq(attendance.orgId, orgId),
        isNull(attendance.deletedAt)
      ))
      .groupBy(attendance.status)

    // Get total enrolled students in the classroom
    let totalStudents = 0
    if (sessionInfo[0].classroomId) {
      const enrolledStudents = await this.db
        .select({ count: count(classroomStudentEnrollment.studentId) })
        .from(classroomStudentEnrollment)
        .where(and(
          eq(classroomStudentEnrollment.classroomId, sessionInfo[0].classroomId),
          eq(classroomStudentEnrollment.status, 'active'),
          eq(classroomStudentEnrollment.orgId, orgId),
          isNull(classroomStudentEnrollment.deletedAt)
        ))

      totalStudents = enrolledStudents[0]?.count || 0
    }

    const countMap = new Map(attendanceCounts.map(ac => [ac.status, ac.count]))
    const totalMarked = attendanceCounts.reduce((sum, ac) => sum + ac.count, 0)

    return {
      timetableId,
      sessionTitle: sessionInfo[0].sessionTitle,
      sessionStartDateTime: sessionInfo[0].sessionStartDateTime,
      totalStudents,
      presentCount: countMap.get('PRESENT') || 0,
      absentCount: countMap.get('ABSENT') || 0,
      lateCount: countMap.get('LATE') || 0,
      excusedCount: countMap.get('EXCUSED') || 0,
      sickCount: countMap.get('SICK') || 0,
      notMarkedCount: totalStudents - totalMarked,
    }
  }

  async getStudentAttendanceSummary(studentId: string, orgId: string, startDate?: Date, endDate?: Date): Promise<StudentAttendanceSummary> {
    let whereConditions = [
      eq(attendance.studentId, studentId),
      eq(attendance.orgId, orgId),
      isNull(attendance.deletedAt)
    ]

    if (startDate) {
      whereConditions.push(gte(timetable.startDateTime, startDate))
    }
    if (endDate) {
      whereConditions.push(lte(timetable.startDateTime, endDate))
    }

    // Get student info
    const studentInfo = await this.db
      .select({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
      })
      .from(user)
      .where(eq(user.id, studentId))

    if (!studentInfo[0]) {
      throw new Error('Student not found')
    }

    // Get attendance counts by status
    const attendanceCounts = await this.db
      .select({
        status: attendance.status,
        count: count(attendance.id),
      })
      .from(attendance)
      .leftJoin(timetable, eq(attendance.timetableId, timetable.id))
      .where(and(...whereConditions))
      .groupBy(attendance.status)

    const countMap = new Map(attendanceCounts.map(ac => [ac.status, ac.count]))
    const totalSessions = attendanceCounts.reduce((sum, ac) => sum + ac.count, 0)

    const presentCount = countMap.get('PRESENT') || 0
    const absentCount = countMap.get('ABSENT') || 0
    const lateCount = countMap.get('LATE') || 0
    const excusedCount = countMap.get('EXCUSED') || 0
    const sickCount = countMap.get('SICK') || 0

    const attendanceRate = totalSessions > 0 ? (presentCount + lateCount) / totalSessions * 100 : 0

    return {
      studentId,
      studentName: studentInfo[0].name,
      studentLastName: studentInfo[0].lastName,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      sickCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimal places
    }
  }
}

// Factory function to create service instance
export function createAttendanceManagementService(db: NodePgDatabase) {
  return new AttendanceManagementService(db)
}
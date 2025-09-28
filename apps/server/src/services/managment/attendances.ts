import { user } from '@/db/schema/auth'
import { attendance } from '@/db/schema/attendance'
import { classroom, classroomStudentEnrollment } from '@/db/schema/classroom'
import { educationSubject } from '@/db/schema/education'
import { sessionInstance } from '@/db/schema/sessionInstance'
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
    if (query?.sessionInstanceId) {
      whereConditions.push(eq(attendance.sessionInstanceId, query.sessionInstanceId))
    }
    if (query?.studentId) {
      whereConditions.push(eq(attendance.studentId, query.studentId))
    }
    if (query?.status) {
      whereConditions.push(eq(attendance.status, query.status))
    }
    if (query?.startDate) {
      whereConditions.push(gte(sessionInstance.startDateTime, query.startDate))
    }
    if (query?.endDate) {
      whereConditions.push(lte(sessionInstance.startDateTime, query.endDate))
    }
    if (query?.classroomId) {
      whereConditions.push(eq(sessionInstance.classroomId, query.classroomId))
    }
    if (query?.educationSubjectId) {
      whereConditions.push(eq(sessionInstance.educationSubjectId, query.educationSubjectId))
    }

    const results = await this.db
      .select({
        attendanceId: attendance.id,
        attendanceStatus: attendance.status,
        attendanceNote: attendance.note,
        attendanceStudentId: attendance.studentId,
        attendanceSessionInstanceId: attendance.sessionInstanceId,
        attendanceMarkedAt: attendance.markedAt,
        attendanceArrivedAt: attendance.arrivedAt,
        // Student data
        studentId: user.id,
        studentName: user.name,
        studentLastName: user.lastName,
        // Session instance data
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
      })
      .from(attendance)
      .leftJoin(user, eq(attendance.studentId, user.id))
      .leftJoin(sessionInstance, eq(attendance.sessionInstanceId, sessionInstance.id))
      .where(and(...whereConditions))

    return results.map((row) => ({
      id: row.attendanceId,
      status: row.attendanceStatus,
      note: row.attendanceNote,
      studentId: row.attendanceStudentId,
      sessionInstanceId: row.attendanceSessionInstanceId,
      markedAt: row.attendanceMarkedAt,
      arrivedAt: row.attendanceArrivedAt,
      student: {
        id: row.studentId!,
        name: row.studentName!,
        lastName: row.studentLastName!,
      },
      sessionInstance: {
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
        attendanceSessionInstanceId: attendance.sessionInstanceId,
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
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
        sessionEndDateTime: sessionInstance.endDateTime,
      })
      .from(attendance)
      .leftJoin(user, eq(attendance.studentId, user.id))
      .leftJoin(sessionInstance, eq(attendance.sessionInstanceId, sessionInstance.id))
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
      sessionInstanceId: row.attendanceSessionInstanceId,
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
      sessionInstance: {
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
        eq(attendance.sessionInstanceId, input.sessionInstanceId),
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
        sessionInstanceId: input.sessionInstanceId,
        arrivedAt: input.arrivedAt || null,
        orgId,
        createdByUserId: userId,
      })
      .returning({
        id: attendance.id,
        status: attendance.status,
        note: attendance.note,
        studentId: attendance.studentId,
        sessionInstanceId: attendance.sessionInstanceId,
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
        sessionInstanceId: attendance.sessionInstanceId
      })
      .from(attendance)
      .where(and(
        eq(attendance.sessionInstanceId, input.sessionInstanceId),
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
      sessionInstanceId: input.sessionInstanceId,
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
        sessionInstanceId: attendance.sessionInstanceId,
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
        sessionInstanceId: attendance.sessionInstanceId,
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

  async getSessionAttendanceSummary(sessionInstanceId: string, orgId: string): Promise<AttendanceSummary> {
    // Get session info and total enrolled students
    const sessionInfo = await this.db
      .select({
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
        classroomId: sessionInstance.classroomId,
      })
      .from(sessionInstance)
      .where(and(
        eq(sessionInstance.id, sessionInstanceId),
        eq(sessionInstance.orgId, orgId),
        isNull(sessionInstance.deletedAt)
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
        eq(attendance.sessionInstanceId, sessionInstanceId),
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
      sessionInstanceId,
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
      whereConditions.push(gte(sessionInstance.startDateTime, startDate))
    }
    if (endDate) {
      whereConditions.push(lte(sessionInstance.startDateTime, endDate))
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
      .leftJoin(sessionInstance, eq(attendance.sessionInstanceId, sessionInstance.id))
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
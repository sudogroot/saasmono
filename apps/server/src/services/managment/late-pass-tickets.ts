import { user } from '@/db/schema/auth'
import { attendance } from '@/db/schema/attendance'
import { classroom, classroomGroup, classroomGroupMembership, classroomStudentEnrollment } from '@/db/schema/classroom'
import { educationSubject } from '@/db/schema/education'
import { latePassConfig, latePassTicket } from '@/db/schema/late-pass-ticket'
import { room } from '@/db/schema/room'
import { timetable } from '@/db/schema/timetable'
import type {
  CancelTicketInput,
  EligibleStudent,
  GenerateTicketInput,
  GetEligibleStudentsQuery,
  GetTicketsQuery,
  LatePassConfig,
  LatePassTicket,
  LatePassTicketListItem,
  QRValidationResult,
  UpdateLatePassConfigInput,
  UpcomingTimetable,
  UseTicketInput,
  ValidateTicketQRInput
} from '@/types/late-pass-ticket'
import { and, count, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import jwt from 'jsonwebtoken'
import { generateCompleteTicket } from '@/lib/late-pass-ticket-pdf-generator'

export class LatePassTicketService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  /**
   * Generate unique ticket number with format: LPT-YYYY-NNNNNN
   * Counter resets to 000001 each year, max 999999 per year
   */
  private async generateTicketNumber(orgId: string): Promise<string> {
    const currentYear = new Date().getFullYear()
    const yearPrefix = `LPT-${currentYear}-`

    // Find the highest ticket number for current year
    const latestTicket = await this.db
      .select({ ticketNumber: latePassTicket.ticketNumber })
      .from(latePassTicket)
      .where(
        and(
          eq(latePassTicket.orgId, orgId),
          sql`${latePassTicket.ticketNumber} LIKE ${yearPrefix + '%'}`
        )
      )
      .orderBy(desc(latePassTicket.ticketNumber))
      .limit(1)

    let nextNumber = 1

    if (latestTicket[0]) {
      // Extract the numeric part and increment
      const parts = latestTicket[0].ticketNumber.split('-')
      const numericPart = parts[2]
      if (numericPart) {
        nextNumber = parseInt(numericPart, 10) + 1
      }
    }

    // Ensure we don't exceed 999999
    if (nextNumber > 999999) {
      throw new Error('Ticket number limit reached for this year (999999)')
    }

    // Pad to 6 digits
    const paddedNumber = nextNumber.toString().padStart(6, '0')

    return `${yearPrefix}${paddedNumber}`
  }

  /**
   * Get JWT secret from environment or throw error
   */
  private getJWTSecret(): string {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    return secret
  }

  /**
   * Generate JWT token for QR code data
   * Contains: ticketId, studentId, timetableId, expiration
   */
  private generateQRToken(
    ticketId: string,
    studentId: string,
    timetableId: string,
    expiresAt: Date
  ): string {
    const secret = this.getJWTSecret()

    return jwt.sign(
      {
        ticketId,
        studentId,
        timetableId,
        type: 'late_pass_ticket',
      },
      secret,
      {
        expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000), // Seconds until expiration
      }
    )
  }

  /**
   * Validate and decode QR token
   */
  private validateQRToken(token: string): {
    ticketId: string
    studentId: string
    timetableId: string
  } | null {
    try {
      const secret = this.getJWTSecret()
      const decoded = jwt.verify(token, secret) as any

      if (decoded.type !== 'late_pass_ticket') {
        return null
      }

      return {
        ticketId: decoded.ticketId,
        studentId: decoded.studentId,
        timetableId: decoded.timetableId,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Get or create late pass configuration for organization
   */
  async getConfig(orgId: string): Promise<LatePassConfig> {
    const config = await this.db
      .select()
      .from(latePassConfig)
      .where(eq(latePassConfig.orgId, orgId))
      .limit(1)

    if (config[0]) {
      return config[0] as LatePassConfig
    }

    // Create default config if not exists
    const newConfig = await this.db
      .insert(latePassConfig)
      .values({ orgId })
      .returning()

    return newConfig[0] as LatePassConfig
  }

  /**
   * Update late pass configuration
   */
  async updateConfig(
    orgId: string,
    updates: UpdateLatePassConfigInput,
    userId: string
  ): Promise<LatePassConfig> {
    const result = await this.db
      .update(latePassConfig)
      .set({
        ...updates,
        updatedByUserId: userId,
      })
      .where(eq(latePassConfig.orgId, orgId))
      .returning()

    if (!result[0]) {
      throw new Error('Configuration not found')
    }

    return result[0] as LatePassConfig
  }

  /**
   * Get eligible students (those who were absent in last attendance)
   * Filters by classroom OR classroom_group
   */
  async getEligibleStudents(
    orgId: string,
    filter: GetEligibleStudentsQuery
  ): Promise<EligibleStudent[]> {
    let studentIds: string[] = []

    // Get students based on classroom or classroomGroup
    if (filter.classroomId) {
      const students = await this.db
        .select({ studentId: classroomStudentEnrollment.studentId })
        .from(classroomStudentEnrollment)
        .where(
          and(
            eq(classroomStudentEnrollment.classroomId, filter.classroomId),
            eq(classroomStudentEnrollment.status, 'active'),
            eq(classroomStudentEnrollment.orgId, orgId),
            isNull(classroomStudentEnrollment.deletedAt)
          )
        )

      studentIds = students.map(s => s.studentId)
    } else if (filter.classroomGroupId) {
      const students = await this.db
        .select({ studentId: classroomGroupMembership.studentId })
        .from(classroomGroupMembership)
        .where(
          and(
            eq(classroomGroupMembership.classroomGroupId, filter.classroomGroupId),
            eq(classroomGroupMembership.isActive, true),
            eq(classroomGroupMembership.orgId, orgId)
          )
        )

      studentIds = students.map(s => s.studentId)
    }

    if (studentIds.length === 0) {
      return []
    }

    // Get configuration for upcoming timetables window
    const config = await this.getConfig(orgId)

    // For each student, get their last attendance and filter by absent status
    const eligibleStudents: EligibleStudent[] = []

    for (const studentId of studentIds) {
      // Get student info
      const studentInfo = await this.db
        .select({
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, studentId))
        .limit(1)

      if (!studentInfo[0]) continue

      // Get last attendance record (most recent)
      const lastAttendanceRecord = await this.db
        .select({
          attendanceId: attendance.id,
          attendanceStatus: attendance.status,
          attendanceMarkedAt: attendance.markedAt,
          timetableId: timetable.id,
          timetableTitle: timetable.title,
          timetableStartDateTime: timetable.startDateTime,
        })
        .from(attendance)
        .innerJoin(timetable, eq(attendance.timetableId, timetable.id))
        .where(
          and(
            eq(attendance.studentId, studentId),
            eq(attendance.orgId, orgId),
            isNull(attendance.deletedAt)
          )
        )
        .orderBy(desc(attendance.markedAt))
        .limit(1)

      // Student is eligible if:
      // 1. They have an attendance record with status ABSENT, EXCUSED, or SICK
      // 2. OR they have NO attendance records (considered PRESENT by default, so NOT eligible)
      const lastAttendance = lastAttendanceRecord[0]

      if (!lastAttendance) {
        // No attendance records = PRESENT by default = NOT eligible
        continue
      }

      const status = lastAttendance.attendanceStatus
      if (status === 'PRESENT' || status === 'LATE') {
        // Not eligible
        continue
      }

      // Count upcoming timetables for this student
      const now = new Date()
      const validityEnd = new Date()
      validityEnd.setDate(validityEnd.getDate() + config.ticketValidityDays)

      const upcomingCount = await this.getStudentUpcomingTimetables(
        studentId,
        orgId,
        config
      )

      // Count active tickets (ISSUED status, not expired)
      const activeTicketsResult = await this.db
        .select({ count: count(latePassTicket.id) })
        .from(latePassTicket)
        .where(
          and(
            eq(latePassTicket.studentId, studentId),
            eq(latePassTicket.orgId, orgId),
            eq(latePassTicket.status, 'ISSUED'),
            gte(latePassTicket.expiresAt, now)
          )
        )

      eligibleStudents.push({
        id: studentInfo[0].id,
        name: studentInfo[0].name,
        lastName: studentInfo[0].lastName,
        email: studentInfo[0].email,
        lastAttendance: {
          id: lastAttendance.attendanceId,
          status: status as 'ABSENT' | 'EXCUSED' | 'SICK',
          markedAt: lastAttendance.attendanceMarkedAt,
          timetable: {
            id: lastAttendance.timetableId,
            title: lastAttendance.timetableTitle,
            startDateTime: lastAttendance.timetableStartDateTime,
          },
        },
        upcomingTimetablesCount: upcomingCount.length,
        activeTicketsCount: activeTicketsResult[0]?.count || 0,
      })
    }

    return eligibleStudents
  }

  /**
   * Get upcoming timetables for a student within validity window
   */
  async getStudentUpcomingTimetables(
    studentId: string,
    orgId: string,
    config: LatePassConfig
  ): Promise<UpcomingTimetable[]> {
    const now = new Date()
    const validityEnd = new Date()
    validityEnd.setDate(validityEnd.getDate() + config.ticketValidityDays)

    // Get student's classrooms
    const studentClassrooms = await this.db
      .select({ classroomId: classroomStudentEnrollment.classroomId })
      .from(classroomStudentEnrollment)
      .where(
        and(
          eq(classroomStudentEnrollment.studentId, studentId),
          eq(classroomStudentEnrollment.status, 'active'),
          eq(classroomStudentEnrollment.orgId, orgId),
          isNull(classroomStudentEnrollment.deletedAt)
        )
      )

    // Get student's classroom groups
    const studentClassroomGroups = await this.db
      .select({ classroomGroupId: classroomGroupMembership.classroomGroupId })
      .from(classroomGroupMembership)
      .where(
        and(
          eq(classroomGroupMembership.studentId, studentId),
          eq(classroomGroupMembership.isActive, true),
          eq(classroomGroupMembership.orgId, orgId)
        )
      )

    const classroomIds = studentClassrooms.map(c => c.classroomId)
    const classroomGroupIds = studentClassroomGroups.map(g => g.classroomGroupId)

    if (classroomIds.length === 0 && classroomGroupIds.length === 0) {
      return []
    }

    // Build conditions for timetables
    const timetableConditions = [
      eq(timetable.orgId, orgId),
      isNull(timetable.deletedAt),
      gte(timetable.startDateTime, now),
      lte(timetable.startDateTime, validityEnd),
    ]

    // Add classroom/group filters
    const classroomOrGroupConditions = []
    if (classroomIds.length > 0) {
      classroomOrGroupConditions.push(
        sql`${timetable.classroomId} IN ${classroomIds}`
      )
    }
    if (classroomGroupIds.length > 0) {
      classroomOrGroupConditions.push(
        sql`${timetable.classroomGroupId} IN ${classroomGroupIds}`
      )
    }

    // Get upcoming timetables
    const timetables = await this.db
      .select({
        timetableId: timetable.id,
        timetableTitle: timetable.title,
        timetableStartDateTime: timetable.startDateTime,
        timetableEndDateTime: timetable.endDateTime,
        // Subject
        subjectId: educationSubject.id,
        subjectDisplayNameAr: educationSubject.displayNameAr,
        subjectDisplayNameEn: educationSubject.displayNameEn,
        // Room
        roomId: room.id,
        roomName: room.name,
        // Teacher (from timetable.userId - need to join user table)
        teacherId: user.id,
        teacherName: user.name,
        teacherLastName: user.lastName,
      })
      .from(timetable)
      .leftJoin(educationSubject, eq(timetable.educationSubjectId, educationSubject.id))
      .leftJoin(room, eq(timetable.roomId, room.id))
      .leftJoin(user, eq(timetable.teacherId, user.id))
      .where(
        and(
          ...timetableConditions,
          or(...classroomOrGroupConditions)
        )
      )
      .orderBy(timetable.startDateTime)

    // For each timetable, check if student has active ticket and if within generation window
    const upcomingTimetables: UpcomingTimetable[] = []

    for (const t of timetables) {
      // Check if student already has an active ticket for this timetable
      const existingTicket = await this.db
        .select({ id: latePassTicket.id })
        .from(latePassTicket)
        .where(
          and(
            eq(latePassTicket.studentId, studentId),
            eq(latePassTicket.timetableId, t.timetableId),
            eq(latePassTicket.orgId, orgId),
            eq(latePassTicket.status, 'ISSUED')
          )
        )
        .limit(1)

      // Check if timetable is within generation window
      // Can generate ticket until: startDateTime + maxGenerationDelayMinutes
      const generationDeadline = new Date(t.timetableStartDateTime)
      generationDeadline.setMinutes(
        generationDeadline.getMinutes() + config.maxGenerationDelayMinutes
      )

      const canGenerateTicket = now <= generationDeadline

      upcomingTimetables.push({
        id: t.timetableId,
        title: t.timetableTitle,
        startDateTime: t.timetableStartDateTime,
        endDateTime: t.timetableEndDateTime,
        educationSubject: t.subjectId
          ? {
              id: t.subjectId,
              displayNameAr: t.subjectDisplayNameAr!,
              displayNameEn: t.subjectDisplayNameEn,
            }
          : null,
        room: {
          id: t.roomId!,
          name: t.roomName!,
        },
        teacher: {
          id: t.teacherId!,
          name: t.teacherName!,
          lastName: t.teacherLastName!,
        },
        hasActiveTicket: existingTicket.length > 0,
        canGenerateTicket,
      })
    }

    return upcomingTimetables
  }

  /**
   * Generate a new late pass ticket
   */
  async generateTicket(
    input: GenerateTicketInput,
    orgId: string,
    userId: string
  ): Promise<LatePassTicket> {
    // Get configuration
    const config = await this.getConfig(orgId)

    // Validate timetable exists and is within generation window
    const timetableResult = await this.db
      .select({
        id: timetable.id,
        title: timetable.title,
        startDateTime: timetable.startDateTime,
        endDateTime: timetable.endDateTime,
      })
      .from(timetable)
      .where(
        and(
          eq(timetable.id, input.timetableId),
          eq(timetable.orgId, orgId),
          isNull(timetable.deletedAt)
        )
      )
      .limit(1)

    if (!timetableResult[0]) {
      throw new Error('Timetable not found')
    }

    const tt = timetableResult[0]

    // Check generation time window
    const now = new Date()
    const generationDeadline = new Date(tt.startDateTime)
    generationDeadline.setMinutes(
      generationDeadline.getMinutes() + config.maxGenerationDelayMinutes
    )

    if (now > generationDeadline) {
      throw new Error(
        `Cannot generate ticket. Generation window closed at ${generationDeadline.toISOString()}`
      )
    }

    // Check if student already has active ticket for this timetable
    const existingTicket = await this.db
      .select({ id: latePassTicket.id })
      .from(latePassTicket)
      .where(
        and(
          eq(latePassTicket.studentId, input.studentId),
          eq(latePassTicket.timetableId, input.timetableId),
          eq(latePassTicket.orgId, orgId),
          eq(latePassTicket.status, 'ISSUED')
        )
      )

    if (existingTicket[0]) {
      throw new Error('Student already has an active ticket for this timetable')
    }

    // Check if student has other active tickets (if not allowed)
    if (!config.allowMultipleActiveTickets) {
      const otherActiveTickets = await this.db
        .select({ id: latePassTicket.id })
        .from(latePassTicket)
        .where(
          and(
            eq(latePassTicket.studentId, input.studentId),
            eq(latePassTicket.orgId, orgId),
            eq(latePassTicket.status, 'ISSUED'),
            gte(latePassTicket.expiresAt, now)
          )
        )

      if (otherActiveTickets.length > 0) {
        throw new Error(
          'Student already has an active ticket for another timetable. Only one active ticket allowed.'
        )
      }
    }

    // Calculate expiration: startDateTime + maxAcceptanceDelayMinutes
    const expiresAt = new Date(tt.startDateTime)
    expiresAt.setMinutes(expiresAt.getMinutes() + config.maxAcceptanceDelayMinutes)

    // Generate unique ticket number
    const ticketNumber = await this.generateTicketNumber(orgId)

    // Create ticket (will generate QR code and PDF later in Phase 4)
    const newTicketResult = await this.db
      .insert(latePassTicket)
      .values({
        ticketNumber,
        studentId: input.studentId,
        timetableId: input.timetableId,
        status: 'ISSUED',
        expiresAt,
        qrCodeData: '', // Placeholder, will be updated with JWT
        issuedByUserId: userId,
        orgId,
      })
      .returning()

    if (!newTicketResult[0]) {
      throw new Error('Failed to create ticket')
    }

    const newTicket = newTicketResult[0]

    // Generate QR token now that we have ticketId
    const qrToken = this.generateQRToken(
      newTicket.id,
      input.studentId,
      input.timetableId,
      expiresAt
    )

    // Update ticket with QR code data
    await this.db
      .update(latePassTicket)
      .set({ qrCodeData: qrToken })
      .where(eq(latePassTicket.id, newTicket.id))

    // Fetch full ticket with relations
    const fullTicket = await this.getTicketById(newTicket.id, orgId)

    // Generate QR code and PDF
    try {
      const { qrCodePath, pdfPath } = await generateCompleteTicket(fullTicket, config)

      // Update ticket with generated file paths
      await this.db
        .update(latePassTicket)
        .set({
          qrCodeImagePath: qrCodePath,
          pdfPath: pdfPath,
        })
        .where(eq(latePassTicket.id, newTicket.id))

      // Return updated ticket
      return this.getTicketById(newTicket.id, orgId)
    } catch (error) {
      // If PDF generation fails, log error but still return ticket
      console.error('Failed to generate PDF/QR for ticket:', error)
      return fullTicket
    }
  }

  /**
   * Get ticket by ID with all relations
   */
  async getTicketById(ticketId: string, orgId: string): Promise<LatePassTicket> {
    const result = await this.db
      .select({
        // Ticket fields
        ticketId: latePassTicket.id,
        ticketNumber: latePassTicket.ticketNumber,
        ticketStudentId: latePassTicket.studentId,
        ticketTimetableId: latePassTicket.timetableId,
        ticketStatus: latePassTicket.status,
        ticketIssuedAt: latePassTicket.issuedAt,
        ticketUsedAt: latePassTicket.usedAt,
        ticketExpiresAt: latePassTicket.expiresAt,
        ticketQrCodeData: latePassTicket.qrCodeData,
        ticketQrCodeImagePath: latePassTicket.qrCodeImagePath,
        ticketPdfPath: latePassTicket.pdfPath,
        ticketCanceledAt: latePassTicket.canceledAt,
        ticketCancellationReason: latePassTicket.cancellationReason,
        ticketOrgId: latePassTicket.orgId,
        ticketCreatedAt: latePassTicket.createdAt,
        ticketUpdatedAt: latePassTicket.updatedAt,
        // Student
        studentId: user.id,
        studentName: user.name,
        studentLastName: user.lastName,
        studentEmail: user.email,
        // Timetable
        timetableId: timetable.id,
        timetableTitle: timetable.title,
        timetableStartDateTime: timetable.startDateTime,
        timetableEndDateTime: timetable.endDateTime,
        // Subject
        subjectId: educationSubject.id,
        subjectDisplayNameAr: educationSubject.displayNameAr,
        subjectDisplayNameEn: educationSubject.displayNameEn,
        // Room
        roomId: room.id,
        roomName: room.name,
        // Classroom
        classroomId: classroom.id,
        classroomName: classroom.name,
        // Classroom Group
        classroomGroupId: classroomGroup.id,
        classroomGroupName: classroomGroup.name,
        // Issued by
        issuedById: sql<string>`issued_by.id`,
        issuedByName: sql<string>`issued_by.name`,
        issuedByLastName: sql<string>`issued_by.last_name`,
        // Canceled by
        canceledById: sql<string>`canceled_by.id`,
        canceledByName: sql<string>`canceled_by.name`,
        canceledByLastName: sql<string>`canceled_by.last_name`,
      })
      .from(latePassTicket)
      .innerJoin(user, eq(latePassTicket.studentId, user.id))
      .innerJoin(timetable, eq(latePassTicket.timetableId, timetable.id))
      .leftJoin(educationSubject, eq(timetable.educationSubjectId, educationSubject.id))
      .leftJoin(room, eq(timetable.roomId, room.id))
      .leftJoin(classroom, eq(timetable.classroomId, classroom.id))
      .leftJoin(classroomGroup, eq(timetable.classroomGroupId, classroomGroup.id))
      .leftJoin(
        sql`${user} AS issued_by`,
        sql`${latePassTicket.issuedByUserId} = issued_by.id`
      )
      .leftJoin(
        sql`${user} AS canceled_by`,
        sql`${latePassTicket.canceledByUserId} = canceled_by.id`
      )
      .where(
        and(eq(latePassTicket.id, ticketId), eq(latePassTicket.orgId, orgId))
      )
      .limit(1)

    if (!result[0]) {
      throw new Error('Ticket not found')
    }

    const t = result[0]

    return {
      id: t.ticketId,
      ticketNumber: t.ticketNumber,
      studentId: t.ticketStudentId,
      timetableId: t.ticketTimetableId,
      status: t.ticketStatus as 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELED',
      issuedAt: t.ticketIssuedAt,
      issuedByUserId: t.issuedById,
      usedAt: t.ticketUsedAt,
      expiresAt: t.ticketExpiresAt,
      qrCodeData: t.ticketQrCodeData,
      qrCodeImagePath: t.ticketQrCodeImagePath,
      pdfPath: t.ticketPdfPath,
      canceledByUserId: t.canceledById || null,
      canceledAt: t.ticketCanceledAt,
      cancellationReason: t.ticketCancellationReason,
      orgId: t.ticketOrgId,
      createdAt: t.ticketCreatedAt,
      updatedAt: t.ticketUpdatedAt,
      student: {
        id: t.studentId,
        name: t.studentName,
        lastName: t.studentLastName,
        email: t.studentEmail,
      },
      timetable: {
        id: t.timetableId,
        title: t.timetableTitle,
        startDateTime: t.timetableStartDateTime,
        endDateTime: t.timetableEndDateTime,
        educationSubject: t.subjectId
          ? {
              id: t.subjectId,
              displayNameAr: t.subjectDisplayNameAr!,
              displayNameEn: t.subjectDisplayNameEn,
            }
          : null,
        room: {
          id: t.roomId!,
          name: t.roomName!,
        },
        classroom: t.classroomId
          ? {
              id: t.classroomId,
              name: t.classroomName!,
            }
          : null,
        classroomGroup: t.classroomGroupId
          ? {
              id: t.classroomGroupId,
              name: t.classroomGroupName!,
            }
          : null,
      },
      issuedBy: {
        id: t.issuedById,
        name: t.issuedByName,
        lastName: t.issuedByLastName,
      },
      canceledBy: t.canceledById
        ? {
            id: t.canceledById,
            name: t.canceledByName,
            lastName: t.canceledByLastName,
          }
        : null,
    }
  }

  /**
   * Get list of tickets with optional filters
   */
  async getTickets(
    orgId: string,
    query?: GetTicketsQuery
  ): Promise<LatePassTicketListItem[]> {
    const conditions = [eq(latePassTicket.orgId, orgId)]

    if (query?.studentId) {
      conditions.push(eq(latePassTicket.studentId, query.studentId))
    }
    if (query?.timetableId) {
      conditions.push(eq(latePassTicket.timetableId, query.timetableId))
    }
    if (query?.status) {
      conditions.push(eq(latePassTicket.status, query.status))
    }
    if (query?.startDate) {
      conditions.push(gte(latePassTicket.issuedAt, query.startDate))
    }
    if (query?.endDate) {
      conditions.push(lte(latePassTicket.issuedAt, query.endDate))
    }
    if (query?.issuedByUserId) {
      conditions.push(eq(latePassTicket.issuedByUserId, query.issuedByUserId))
    }

    const results = await this.db
      .select({
        ticketId: latePassTicket.id,
        ticketNumber: latePassTicket.ticketNumber,
        ticketStudentId: latePassTicket.studentId,
        ticketStatus: latePassTicket.status,
        ticketIssuedAt: latePassTicket.issuedAt,
        ticketExpiresAt: latePassTicket.expiresAt,
        ticketUsedAt: latePassTicket.usedAt,
        // Student
        studentId: user.id,
        studentName: user.name,
        studentLastName: user.lastName,
        // Timetable
        timetableId: timetable.id,
        timetableTitle: timetable.title,
        timetableStartDateTime: timetable.startDateTime,
        timetableEndDateTime: timetable.endDateTime,
        // Issued by
        issuedById: sql<string>`issued_by.id`,
        issuedByName: sql<string>`issued_by.name`,
        issuedByLastName: sql<string>`issued_by.last_name`,
      })
      .from(latePassTicket)
      .innerJoin(user, eq(latePassTicket.studentId, user.id))
      .innerJoin(timetable, eq(latePassTicket.timetableId, timetable.id))
      .leftJoin(
        sql`${user} AS issued_by`,
        sql`${latePassTicket.issuedByUserId} = issued_by.id`
      )
      .where(and(...conditions))
      .orderBy(desc(latePassTicket.issuedAt))

    return results.map(t => ({
      id: t.ticketId,
      ticketNumber: t.ticketNumber,
      studentId: t.ticketStudentId,
      status: t.ticketStatus as 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELED',
      issuedAt: t.ticketIssuedAt,
      expiresAt: t.ticketExpiresAt,
      usedAt: t.ticketUsedAt,
      student: {
        id: t.studentId,
        name: t.studentName,
        lastName: t.studentLastName,
      },
      timetable: {
        id: t.timetableId,
        title: t.timetableTitle,
        startDateTime: t.timetableStartDateTime,
        endDateTime: t.timetableEndDateTime,
      },
      issuedBy: {
        id: t.issuedById,
        name: t.issuedByName,
        lastName: t.issuedByLastName,
      },
    }))
  }

  /**
   * Cancel a ticket
   */
  async cancelTicket(
    input: CancelTicketInput,
    orgId: string,
    userId: string
  ): Promise<LatePassTicket> {
    // Verify ticket exists and is in ISSUED status
    const ticket = await this.db
      .select({ status: latePassTicket.status })
      .from(latePassTicket)
      .where(
        and(eq(latePassTicket.id, input.ticketId), eq(latePassTicket.orgId, orgId))
      )
      .limit(1)

    if (!ticket[0]) {
      throw new Error('Ticket not found')
    }

    if (ticket[0].status !== 'ISSUED') {
      throw new Error(`Cannot cancel ticket with status: ${ticket[0].status}`)
    }

    // Update ticket
    await this.db
      .update(latePassTicket)
      .set({
        status: 'CANCELED',
        canceledByUserId: userId,
        canceledAt: new Date(),
        cancellationReason: input.reason,
      })
      .where(eq(latePassTicket.id, input.ticketId))

    return this.getTicketById(input.ticketId, orgId)
  }

  /**
   * Validate QR code and return validation result
   */
  async validateQRCode(
    input: ValidateTicketQRInput,
    orgId: string
  ): Promise<QRValidationResult> {
    // Decode QR token
    const decoded = this.validateQRToken(input.qrData)

    if (!decoded) {
      return {
        valid: false,
        ticket: null,
        error: 'Invalid QR code',
        errorCode: 'INVALID_QR',
      }
    }

    // Verify timetable matches
    if (decoded.timetableId !== input.timetableId) {
      return {
        valid: false,
        ticket: null,
        error: 'QR code is not valid for this timetable',
        errorCode: 'WRONG_TIMETABLE',
      }
    }

    // Get ticket
    let ticket: LatePassTicket
    try {
      ticket = await this.getTicketById(decoded.ticketId, orgId)
    } catch {
      return {
        valid: false,
        ticket: null,
        error: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND',
      }
    }

    // Check ticket status
    if (ticket.status === 'USED') {
      return {
        valid: false,
        ticket,
        error: 'Ticket has already been used',
        errorCode: 'TICKET_ALREADY_USED',
      }
    }

    if (ticket.status === 'CANCELED') {
      return {
        valid: false,
        ticket,
        error: 'Ticket has been canceled',
        errorCode: 'TICKET_CANCELED',
      }
    }

    if (ticket.status === 'EXPIRED') {
      return {
        valid: false,
        ticket,
        error: 'Ticket has expired',
        errorCode: 'TICKET_EXPIRED',
      }
    }

    // Check if expired by time
    const now = new Date()
    if (now > ticket.expiresAt) {
      return {
        valid: false,
        ticket,
        error: 'Ticket has expired',
        errorCode: 'TICKET_EXPIRED',
      }
    }

    // All validations passed
    return {
      valid: true,
      ticket,
      error: null,
      errorCode: null,
    }
  }

  /**
   * Use a ticket (mark as USED and create attendance record)
   */
  async useTicket(
    input: UseTicketInput,
    orgId: string
  ): Promise<{ ticket: LatePassTicket; attendanceId: string }> {
    // Get ticket
    const ticket = await this.getTicketById(input.ticketId, orgId)

    if (ticket.status !== 'ISSUED') {
      throw new Error(`Cannot use ticket with status: ${ticket.status}`)
    }

    // Check expiration
    const now = new Date()
    if (now > ticket.expiresAt) {
      throw new Error('Ticket has expired')
    }

    // Update ticket status
    await this.db
      .update(latePassTicket)
      .set({
        status: 'USED',
        usedAt: now,
      })
      .where(eq(latePassTicket.id, input.ticketId))

    // Create attendance record
    const attendanceResult = await this.db
      .insert(attendance)
      .values({
        studentId: ticket.studentId,
        timetableId: ticket.timetableId,
        status: input.attendanceStatus,
        arrivedAt: now,
        orgId,
        createdByUserId: ticket.studentId, // Student self-marked via QR
      })
      .returning({ id: attendance.id })

    if (!attendanceResult[0]) {
      throw new Error('Failed to create attendance record')
    }

    return {
      ticket: await this.getTicketById(input.ticketId, orgId),
      attendanceId: attendanceResult[0].id,
    }
  }

  /**
   * Expire old tickets (for cron job)
   * Auto-expires tickets where expiresAt < now and status = ISSUED
   */
  async expireOldTickets(orgId: string): Promise<number> {
    const now = new Date()

    const result = await this.db
      .update(latePassTicket)
      .set({ status: 'EXPIRED' })
      .where(
        and(
          eq(latePassTicket.orgId, orgId),
          eq(latePassTicket.status, 'ISSUED'),
          lte(latePassTicket.expiresAt, now)
        )
      )
      .returning({ id: latePassTicket.id })

    return result.length
  }
}

// Factory function to create service instance
export function createLatePassTicketService(db: NodePgDatabase) {
  return new LatePassTicketService(db)
}

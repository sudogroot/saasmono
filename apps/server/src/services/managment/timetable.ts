import { user } from '@/db/schema/auth'
import { classroom, classroomGroup } from '@/db/schema/classroom'
import { educationSubject } from '@/db/schema/education'
import { room } from '@/db/schema/room'
import { timetable } from '@/db/schema/timetable'
import type {
  CreateTimetableInput,
  TimetableListItem,
  TimetableQuery,
  UpdateTimetableInput
} from '@/types/timetable'
import { and, eq, gte, isNull, lte } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class TimetableManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getTimetablesList(orgId: string, query?: TimetableQuery) {
    let whereConditions = [eq(timetable.orgId, orgId), isNull(timetable.deletedAt)]

    // Add query filters
    if (query?.startDate) {
      whereConditions.push(gte(timetable.startDateTime, query.startDate))
    }
    if (query?.endDate) {
      whereConditions.push(lte(timetable.startDateTime, query.endDate))
    }
    if (query?.teacherId) {
      whereConditions.push(eq(timetable.teacherId, query.teacherId))
    }
    if (query?.classroomId) {
      whereConditions.push(eq(timetable.classroomId, query.classroomId))
    }
    if (query?.classroomGroupId) {
      whereConditions.push(eq(timetable.classroomGroupId, query.classroomGroupId))
    }
    if (query?.educationSubjectId) {
      whereConditions.push(eq(timetable.educationSubjectId, query.educationSubjectId))
    }
    if (query?.roomId) {
      whereConditions.push(eq(timetable.roomId, query.roomId))
    }
    if (query?.status) {
      whereConditions.push(eq(timetable.status, query.status))
    }

    const results = await this.db
      .select({
        sessionId: timetable.id,
        sessionTitle: timetable.title,
        sessionStartDateTime: timetable.startDateTime,
        sessionEndDateTime: timetable.endDateTime,
        sessionStatus: timetable.status,
        // Teacher data
        teacherId: user.id,
        teacherName: user.name,
        teacherLastName: user.lastName,
        // Subject data
        subjectId: educationSubject.id,
        subjectName: educationSubject.name,
        subjectDisplayNameEn: educationSubject.displayNameEn,
        // Room data
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        // Classroom data (nullable)
        classroomId: classroom.id,
        classroomName: classroom.name,
        // Classroom group data (nullable)
        classroomGroupId: classroomGroup.id,
        classroomGroupName: classroomGroup.name,
      })
      .from(timetable)
      .leftJoin(user, eq(timetable.teacherId, user.id))
      .leftJoin(educationSubject, eq(timetable.educationSubjectId, educationSubject.id))
      .leftJoin(room, eq(timetable.roomId, room.id))
      .leftJoin(classroom, eq(timetable.classroomId, classroom.id))
      .leftJoin(classroomGroup, eq(timetable.classroomGroupId, classroomGroup.id))
      .where(and(...whereConditions))

    return results.map((row) => ({
      id: row.sessionId,
      title: row.sessionTitle,
      startDateTime: row.sessionStartDateTime,
      endDateTime: row.sessionEndDateTime,
      status: row.sessionStatus,
      teacher: {
        id: row.teacherId!,
        name: row.teacherName!,
        lastName: row.teacherLastName!,
      },
      educationSubject: {
        id: row.subjectId!,
        name: row.subjectName!,
        displayNameEn: row.subjectDisplayNameEn!,
      },
      room: {
        id: row.roomId!,
        name: row.roomName!,
        code: row.roomCode!,
      },
      classroom: row.classroomId ? {
        id: row.classroomId,
        name: row.classroomName!,
      } : null,
      classroomGroup: row.classroomGroupId ? {
        id: row.classroomGroupId,
        name: row.classroomGroupName!,
      } : null,
    })) as TimetableListItem[]
  }

  async getTimetableById(timetableId: string, orgId: string) {
    const result = await this.db
      .select({
        sessionId: timetable.id,
        sessionTitle: timetable.title,
        sessionStartDateTime: timetable.startDateTime,
        sessionEndDateTime: timetable.endDateTime,
        sessionStatus: timetable.status,
        sessionClassroomId: timetable.classroomId,
        sessionClassroomGroupId: timetable.classroomGroupId,
        sessionTeacherId: timetable.teacherId,
        sessionEducationSubjectId: timetable.educationSubjectId,
        sessionRoomId: timetable.roomId,
        sessionOrgId: timetable.orgId,
        sessionActualStartDateTime: timetable.actualStartDateTime,
        sessionActualEndDateTime: timetable.actualEndDateTime,
        sessionNotes: timetable.notes,
        sessionAdditionalData: timetable.additionalData,
        sessionCreatedAt: timetable.createdAt,
        sessionUpdatedAt: timetable.updatedAt,
        sessionDeletedAt: timetable.deletedAt,
        // Teacher data
        teacherId: user.id,
        teacherName: user.name,
        teacherLastName: user.lastName,
        teacherEmail: user.email,
        // Subject data
        subjectId: educationSubject.id,
        subjectName: educationSubject.name,
        subjectDisplayNameEn: educationSubject.displayNameEn,
        subjectDisplayNameFr: educationSubject.displayNameFr,
        subjectDisplayNameAr: educationSubject.displayNameAr,
        // Room data
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        // Classroom data (nullable)
        classroomId: classroom.id,
        classroomName: classroom.name,
        classroomCode: classroom.code,
        // Classroom group data (nullable)
        classroomGroupId: classroomGroup.id,
        classroomGroupName: classroomGroup.name,
        classroomGroupCode: classroomGroup.code,
      })
      .from(timetable)
      .leftJoin(user, eq(timetable.teacherId, user.id))
      .leftJoin(educationSubject, eq(timetable.educationSubjectId, educationSubject.id))
      .leftJoin(room, eq(timetable.roomId, room.id))
      .leftJoin(classroom, eq(timetable.classroomId, classroom.id))
      .leftJoin(classroomGroup, eq(timetable.classroomGroupId, classroomGroup.id))
      .where(and(
        eq(timetable.id, timetableId),
        eq(timetable.orgId, orgId),
        isNull(timetable.deletedAt)
      ))

    if (!result[0] || result.length === 0) {
      throw new Error('Session instance not found')
    }

    const row = result[0]

    return {
      id: row.sessionId,
      title: row.sessionTitle,
      startDateTime: row.sessionStartDateTime,
      endDateTime: row.sessionEndDateTime,
      status: row.sessionStatus,
      classroomId: row.sessionClassroomId,
      classroomGroupId: row.sessionClassroomGroupId,
      teacherId: row.sessionTeacherId,
      educationSubjectId: row.sessionEducationSubjectId,
      roomId: row.sessionRoomId,
      orgId: row.sessionOrgId,
      actualStartDateTime: row.sessionActualStartDateTime,
      actualEndDateTime: row.sessionActualEndDateTime,
      notes: row.sessionNotes,
      additionalData: row.sessionAdditionalData,
      createdAt: row.sessionCreatedAt,
      updatedAt: row.sessionUpdatedAt,
      deletedAt: row.sessionDeletedAt,
      teacher: {
        id: row.teacherId!,
        name: row.teacherName!,
        lastName: row.teacherLastName!,
        email: row.teacherEmail!,
      },
      educationSubject: {
        id: row.subjectId!,
        name: row.subjectName!,
        displayNameEn: row.subjectDisplayNameEn!,
        displayNameFr: row.subjectDisplayNameFr!,
        displayNameAr: row.subjectDisplayNameAr!,
      },
      room: {
        id: row.roomId!,
        name: row.roomName!,
        code: row.roomCode!,
      },
      classroom: row.classroomId ? {
        id: row.classroomId,
        name: row.classroomName!,
        code: row.classroomCode!,
      } : null,
      classroomGroup: row.classroomGroupId ? {
        id: row.classroomGroupId,
        name: row.classroomGroupName!,
        code: row.classroomGroupCode!,
      } : null,
    }
  }

  async createTimetable(input: CreateTimetableInput, orgId: string, userId: string) {
    const result = await this.db
      .insert(timetable)
      .values({
        title: input.title,
        startDateTime: input.startDateTime,
        endDateTime: input.endDateTime,
        classroomId: input.classroomId || null,
        classroomGroupId: input.classroomGroupId || null,
        teacherId: input.teacherId,
        educationSubjectId: input.educationSubjectId,
        roomId: input.roomId,
        notes: input.notes || null,
        additionalData: input.additionalData || null,
        orgId,
        createdByUserId: userId,
      })
      .returning({
        id: timetable.id,
        title: timetable.title,
        startDateTime: timetable.startDateTime,
        endDateTime: timetable.endDateTime,
        status: timetable.status,
        classroomId: timetable.classroomId,
        classroomGroupId: timetable.classroomGroupId,
        teacherId: timetable.teacherId,
        educationSubjectId: timetable.educationSubjectId,
        roomId: timetable.roomId,
        orgId: timetable.orgId,
        actualStartDateTime: timetable.actualStartDateTime,
        actualEndDateTime: timetable.actualEndDateTime,
        notes: timetable.notes,
        additionalData: timetable.additionalData,
        createdAt: timetable.createdAt,
        updatedAt: timetable.updatedAt,
        deletedAt: timetable.deletedAt,
      })

    if (!result[0]) {
      throw new Error('Failed to create session instance')
    }

    return result[0]
  }

  async updateTimetable(timetableId: string, input: UpdateTimetableInput, orgId: string, userId: string) {
    const result = await this.db
      .update(timetable)
      .set({
        ...input,
        updatedByUserId: userId,
      })
      .where(and(
        eq(timetable.id, timetableId),
        eq(timetable.orgId, orgId),
        isNull(timetable.deletedAt)
      ))
      .returning({
        id: timetable.id,
        title: timetable.title,
        startDateTime: timetable.startDateTime,
        endDateTime: timetable.endDateTime,
        status: timetable.status,
        classroomId: timetable.classroomId,
        classroomGroupId: timetable.classroomGroupId,
        teacherId: timetable.teacherId,
        educationSubjectId: timetable.educationSubjectId,
        roomId: timetable.roomId,
        orgId: timetable.orgId,
        actualStartDateTime: timetable.actualStartDateTime,
        actualEndDateTime: timetable.actualEndDateTime,
        notes: timetable.notes,
        additionalData: timetable.additionalData,
        createdAt: timetable.createdAt,
        updatedAt: timetable.updatedAt,
        deletedAt: timetable.deletedAt,
      })

    if (!result[0] || result.length === 0) {
      throw new Error('Session instance not found or failed to update')
    }

    return result[0]
  }

  async deleteTimetable(timetableId: string, orgId: string, userId: string) {
    const result = await this.db
      .update(timetable)
      .set({
        deletedAt: new Date(),
        deletedByUserId: userId,
      })
      .where(and(
        eq(timetable.id, timetableId),
        eq(timetable.orgId, orgId),
        isNull(timetable.deletedAt)
      ))
      .returning({ id: timetable.id })

    if (!result[0] || result.length === 0) {
      throw new Error('Session instance not found or failed to delete')
    }

    return { success: true }
  }
}

// Factory function to create service instance
export function createTimetableManagementService(db: NodePgDatabase) {
  return new TimetableManagementService(db)
}
import { user } from '@/db/schema/auth'
import { classroom, classroomGroup } from '@/db/schema/classroom'
import { educationSubject } from '@/db/schema/education'
import { room } from '@/db/schema/room'
import { sessionInstance } from '@/db/schema/sessionInstance'
import type {
  CreateSessionInstanceInput,
  SessionInstanceListItem,
  SessionInstanceQuery,
  UpdateSessionInstanceInput
} from '@/types/sessionInstance'
import { and, eq, gte, isNull, lte } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class SessionInstanceManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getSessionInstancesList(orgId: string, query?: SessionInstanceQuery) {
    let whereConditions = [eq(sessionInstance.orgId, orgId), isNull(sessionInstance.deletedAt)]

    // Add query filters
    if (query?.startDate) {
      whereConditions.push(gte(sessionInstance.startDateTime, query.startDate))
    }
    if (query?.endDate) {
      whereConditions.push(lte(sessionInstance.startDateTime, query.endDate))
    }
    if (query?.teacherId) {
      whereConditions.push(eq(sessionInstance.teacherId, query.teacherId))
    }
    if (query?.classroomId) {
      whereConditions.push(eq(sessionInstance.classroomId, query.classroomId))
    }
    if (query?.classroomGroupId) {
      whereConditions.push(eq(sessionInstance.classroomGroupId, query.classroomGroupId))
    }
    if (query?.educationSubjectId) {
      whereConditions.push(eq(sessionInstance.educationSubjectId, query.educationSubjectId))
    }
    if (query?.roomId) {
      whereConditions.push(eq(sessionInstance.roomId, query.roomId))
    }
    if (query?.status) {
      whereConditions.push(eq(sessionInstance.status, query.status))
    }

    const results = await this.db
      .select({
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
        sessionEndDateTime: sessionInstance.endDateTime,
        sessionStatus: sessionInstance.status,
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
      .from(sessionInstance)
      .leftJoin(user, eq(sessionInstance.teacherId, user.id))
      .leftJoin(educationSubject, eq(sessionInstance.educationSubjectId, educationSubject.id))
      .leftJoin(room, eq(sessionInstance.roomId, room.id))
      .leftJoin(classroom, eq(sessionInstance.classroomId, classroom.id))
      .leftJoin(classroomGroup, eq(sessionInstance.classroomGroupId, classroomGroup.id))
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
    })) as SessionInstanceListItem[]
  }

  async getSessionInstanceById(sessionInstanceId: string, orgId: string) {
    const result = await this.db
      .select({
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
        sessionEndDateTime: sessionInstance.endDateTime,
        sessionStatus: sessionInstance.status,
        sessionClassroomId: sessionInstance.classroomId,
        sessionClassroomGroupId: sessionInstance.classroomGroupId,
        sessionTeacherId: sessionInstance.teacherId,
        sessionEducationSubjectId: sessionInstance.educationSubjectId,
        sessionRoomId: sessionInstance.roomId,
        sessionOrgId: sessionInstance.orgId,
        sessionActualStartDateTime: sessionInstance.actualStartDateTime,
        sessionActualEndDateTime: sessionInstance.actualEndDateTime,
        sessionNotes: sessionInstance.notes,
        sessionAdditionalData: sessionInstance.additionalData,
        sessionCreatedAt: sessionInstance.createdAt,
        sessionUpdatedAt: sessionInstance.updatedAt,
        sessionDeletedAt: sessionInstance.deletedAt,
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
      .from(sessionInstance)
      .leftJoin(user, eq(sessionInstance.teacherId, user.id))
      .leftJoin(educationSubject, eq(sessionInstance.educationSubjectId, educationSubject.id))
      .leftJoin(room, eq(sessionInstance.roomId, room.id))
      .leftJoin(classroom, eq(sessionInstance.classroomId, classroom.id))
      .leftJoin(classroomGroup, eq(sessionInstance.classroomGroupId, classroomGroup.id))
      .where(and(
        eq(sessionInstance.id, sessionInstanceId),
        eq(sessionInstance.orgId, orgId),
        isNull(sessionInstance.deletedAt)
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

  async createSessionInstance(input: CreateSessionInstanceInput, orgId: string, userId: string) {
    const result = await this.db
      .insert(sessionInstance)
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
        id: sessionInstance.id,
        title: sessionInstance.title,
        startDateTime: sessionInstance.startDateTime,
        endDateTime: sessionInstance.endDateTime,
        status: sessionInstance.status,
        classroomId: sessionInstance.classroomId,
        classroomGroupId: sessionInstance.classroomGroupId,
        teacherId: sessionInstance.teacherId,
        educationSubjectId: sessionInstance.educationSubjectId,
        roomId: sessionInstance.roomId,
        orgId: sessionInstance.orgId,
        actualStartDateTime: sessionInstance.actualStartDateTime,
        actualEndDateTime: sessionInstance.actualEndDateTime,
        notes: sessionInstance.notes,
        additionalData: sessionInstance.additionalData,
        createdAt: sessionInstance.createdAt,
        updatedAt: sessionInstance.updatedAt,
        deletedAt: sessionInstance.deletedAt,
      })

    if (!result[0]) {
      throw new Error('Failed to create session instance')
    }

    return result[0]
  }

  async updateSessionInstance(sessionInstanceId: string, input: UpdateSessionInstanceInput, orgId: string, userId: string) {
    const result = await this.db
      .update(sessionInstance)
      .set({
        ...input,
        updatedByUserId: userId,
      })
      .where(and(
        eq(sessionInstance.id, sessionInstanceId),
        eq(sessionInstance.orgId, orgId),
        isNull(sessionInstance.deletedAt)
      ))
      .returning({
        id: sessionInstance.id,
        title: sessionInstance.title,
        startDateTime: sessionInstance.startDateTime,
        endDateTime: sessionInstance.endDateTime,
        status: sessionInstance.status,
        classroomId: sessionInstance.classroomId,
        classroomGroupId: sessionInstance.classroomGroupId,
        teacherId: sessionInstance.teacherId,
        educationSubjectId: sessionInstance.educationSubjectId,
        roomId: sessionInstance.roomId,
        orgId: sessionInstance.orgId,
        actualStartDateTime: sessionInstance.actualStartDateTime,
        actualEndDateTime: sessionInstance.actualEndDateTime,
        notes: sessionInstance.notes,
        additionalData: sessionInstance.additionalData,
        createdAt: sessionInstance.createdAt,
        updatedAt: sessionInstance.updatedAt,
        deletedAt: sessionInstance.deletedAt,
      })

    if (!result[0] || result.length === 0) {
      throw new Error('Session instance not found or failed to update')
    }

    return result[0]
  }

  async deleteSessionInstance(sessionInstanceId: string, orgId: string, userId: string) {
    const result = await this.db
      .update(sessionInstance)
      .set({
        deletedAt: new Date(),
        deletedByUserId: userId,
      })
      .where(and(
        eq(sessionInstance.id, sessionInstanceId),
        eq(sessionInstance.orgId, orgId),
        isNull(sessionInstance.deletedAt)
      ))
      .returning({ id: sessionInstance.id })

    if (!result[0] || result.length === 0) {
      throw new Error('Session instance not found or failed to delete')
    }

    return { success: true }
  }
}

// Factory function to create service instance
export function createSessionInstanceManagementService(db: NodePgDatabase) {
  return new SessionInstanceManagementService(db)
}
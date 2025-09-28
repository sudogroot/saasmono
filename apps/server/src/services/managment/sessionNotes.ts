import { sessionInstance } from '@/db/schema/sessionInstance'
import { sessionNote, sessionNoteAttachment } from '@/db/schema/sessionNote'
import type {
  CreateSessionNoteAttachmentInput,
  CreateSessionNoteInput,
  SessionNoteListItem,
  SessionNoteQuery,
  UpdateSessionNoteInput
} from '@/types/sessionNote'
import { and, count, eq, gte, isNull, lte } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class SessionNoteManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getSessionNotesList(orgId: string, query?: SessionNoteQuery) {
    let whereConditions = [eq(sessionNote.orgId, orgId), isNull(sessionNote.deletedAt)]

    // Add query filters
    if (query?.sessionInstanceId) {
      whereConditions.push(eq(sessionNote.sessionInstanceId, query.sessionInstanceId))
    }
    if (query?.isPrivate !== undefined) {
      whereConditions.push(eq(sessionNote.isPrivate, query.isPrivate))
    }
    if (query?.startDate) {
      whereConditions.push(gte(sessionInstance.startDateTime, query.startDate))
    }
    if (query?.endDate) {
      whereConditions.push(lte(sessionInstance.startDateTime, query.endDate))
    }

    const results = await this.db
      .select({
        noteId: sessionNote.id,
        noteTitle: sessionNote.title,
        noteIsPrivate: sessionNote.isPrivate,
        noteSessionInstanceId: sessionNote.sessionInstanceId,
        noteCreatedAt: sessionNote.createdAt,
        // Session instance data
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
      })
      .from(sessionNote)
      .leftJoin(sessionInstance, eq(sessionNote.sessionInstanceId, sessionInstance.id))
      .where(and(...whereConditions))

    // Get attachment counts for each note
    const noteIds = results.map((r) => r.noteId)

    const attachmentCounts = noteIds.length > 0 ? await this.db
      .select({
        sessionNoteId: sessionNoteAttachment.sessionNoteId,
        attachmentCount: count(sessionNoteAttachment.id),
      })
      .from(sessionNoteAttachment)
      .where(
        and(
          eq(sessionNoteAttachment.orgId, orgId),
          isNull(sessionNoteAttachment.deletedAt)
        )
      )
      .groupBy(sessionNoteAttachment.sessionNoteId) : []

    // Create map for quick lookup
    const attachmentCountMap = new Map(attachmentCounts.map((ac) => [ac.sessionNoteId, ac.attachmentCount]))

    return results.map((row) => ({
      id: row.noteId,
      title: row.noteTitle,
      isPrivate: row.noteIsPrivate,
      sessionInstanceId: row.noteSessionInstanceId,
      createdAt: row.noteCreatedAt,
      sessionInstance: {
        id: row.sessionId!,
        title: row.sessionTitle!,
        startDateTime: row.sessionStartDateTime!,
      },
      attachmentCount: attachmentCountMap.get(row.noteId) || 0,
    })) as SessionNoteListItem[]
  }

  async getSessionNoteById(sessionNoteId: string, orgId: string) {
    const result = await this.db
      .select({
        noteId: sessionNote.id,
        noteTitle: sessionNote.title,
        noteContent: sessionNote.content,
        noteIsPrivate: sessionNote.isPrivate,
        noteSessionInstanceId: sessionNote.sessionInstanceId,
        noteOrgId: sessionNote.orgId,
        noteCreatedAt: sessionNote.createdAt,
        noteUpdatedAt: sessionNote.updatedAt,
        noteDeletedAt: sessionNote.deletedAt,
        // Session instance data
        sessionId: sessionInstance.id,
        sessionTitle: sessionInstance.title,
        sessionStartDateTime: sessionInstance.startDateTime,
        sessionEndDateTime: sessionInstance.endDateTime,
      })
      .from(sessionNote)
      .leftJoin(sessionInstance, eq(sessionNote.sessionInstanceId, sessionInstance.id))
      .where(and(
        eq(sessionNote.id, sessionNoteId),
        eq(sessionNote.orgId, orgId),
        isNull(sessionNote.deletedAt)
      ))

    if (!result[0] || result.length === 0) {
      throw new Error('Session note not found')
    }

    // Get attachments for this note
    const attachments = await this.db
      .select({
        id: sessionNoteAttachment.id,
        fileName: sessionNoteAttachment.fileName,
        fileUrl: sessionNoteAttachment.fileUrl,
        fileSize: sessionNoteAttachment.fileSize,
        mimeType: sessionNoteAttachment.mimeType,
        description: sessionNoteAttachment.description,
      })
      .from(sessionNoteAttachment)
      .where(and(
        eq(sessionNoteAttachment.sessionNoteId, sessionNoteId),
        eq(sessionNoteAttachment.orgId, orgId),
        isNull(sessionNoteAttachment.deletedAt)
      ))

    const row = result[0]

    return {
      id: row.noteId,
      title: row.noteTitle,
      content: row.noteContent,
      isPrivate: row.noteIsPrivate,
      sessionInstanceId: row.noteSessionInstanceId,
      orgId: row.noteOrgId,
      createdAt: row.noteCreatedAt,
      updatedAt: row.noteUpdatedAt,
      deletedAt: row.noteDeletedAt,
      sessionInstance: {
        id: row.sessionId!,
        title: row.sessionTitle!,
        startDateTime: row.sessionStartDateTime!,
        endDateTime: row.sessionEndDateTime!,
      },
      attachments,
    }
  }

  async createSessionNote(input: CreateSessionNoteInput, orgId: string, userId: string) {
    const result = await this.db
      .insert(sessionNote)
      .values({
        title: input.title,
        content: input.content,
        isPrivate: input.isPrivate,
        sessionInstanceId: input.sessionInstanceId,
        orgId,
        createdByUserId: userId,
      })
      .returning({
        id: sessionNote.id,
        title: sessionNote.title,
        content: sessionNote.content,
        isPrivate: sessionNote.isPrivate,
        sessionInstanceId: sessionNote.sessionInstanceId,
        orgId: sessionNote.orgId,
        createdAt: sessionNote.createdAt,
        updatedAt: sessionNote.updatedAt,
        deletedAt: sessionNote.deletedAt,
      })

    if (!result[0]) {
      throw new Error('Failed to create session note')
    }

    return result[0]
  }

  async updateSessionNote(sessionNoteId: string, input: UpdateSessionNoteInput, orgId: string, userId: string) {
    const result = await this.db
      .update(sessionNote)
      .set({
        ...input,
        updatedByUserId: userId,
      })
      .where(and(
        eq(sessionNote.id, sessionNoteId),
        eq(sessionNote.orgId, orgId),
        isNull(sessionNote.deletedAt)
      ))
      .returning({
        id: sessionNote.id,
        title: sessionNote.title,
        content: sessionNote.content,
        isPrivate: sessionNote.isPrivate,
        sessionInstanceId: sessionNote.sessionInstanceId,
        orgId: sessionNote.orgId,
        createdAt: sessionNote.createdAt,
        updatedAt: sessionNote.updatedAt,
        deletedAt: sessionNote.deletedAt,
      })

    if (!result[0] || result.length === 0) {
      throw new Error('Session note not found or failed to update')
    }

    return result[0]
  }

  async deleteSessionNote(sessionNoteId: string, orgId: string, userId: string) {
    const result = await this.db
      .update(sessionNote)
      .set({
        deletedAt: new Date(),
        deletedByUserId: userId,
      })
      .where(and(
        eq(sessionNote.id, sessionNoteId),
        eq(sessionNote.orgId, orgId),
        isNull(sessionNote.deletedAt)
      ))
      .returning({ id: sessionNote.id })

    if (!result[0] || result.length === 0) {
      throw new Error('Session note not found or failed to delete')
    }

    return { success: true }
  }

  async createSessionNoteAttachment(input: CreateSessionNoteAttachmentInput, orgId: string, userId: string) {
    const result = await this.db
      .insert(sessionNoteAttachment)
      .values({
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize || null,
        mimeType: input.mimeType || null,
        description: input.description || null,
        sessionNoteId: input.sessionNoteId,
        orgId,
        createdByUserId: userId,
      })
      .returning({
        id: sessionNoteAttachment.id,
        fileName: sessionNoteAttachment.fileName,
        fileUrl: sessionNoteAttachment.fileUrl,
        fileSize: sessionNoteAttachment.fileSize,
        mimeType: sessionNoteAttachment.mimeType,
        description: sessionNoteAttachment.description,
        sessionNoteId: sessionNoteAttachment.sessionNoteId,
        orgId: sessionNoteAttachment.orgId,
        createdAt: sessionNoteAttachment.createdAt,
        updatedAt: sessionNoteAttachment.updatedAt,
        deletedAt: sessionNoteAttachment.deletedAt,
      })

    if (!result[0]) {
      throw new Error('Failed to create session note attachment')
    }

    return result[0]
  }

  async deleteSessionNoteAttachment(attachmentId: string, orgId: string, userId: string) {
    const result = await this.db
      .update(sessionNoteAttachment)
      .set({
        deletedAt: new Date(),
        deletedByUserId: userId,
      })
      .where(and(
        eq(sessionNoteAttachment.id, attachmentId),
        eq(sessionNoteAttachment.orgId, orgId),
        isNull(sessionNoteAttachment.deletedAt)
      ))
      .returning({ id: sessionNoteAttachment.id })

    if (!result[0] || result.length === 0) {
      throw new Error('Session note attachment not found or failed to delete')
    }

    return { success: true }
  }
}

// Factory function to create service instance
export function createSessionNoteManagementService(db: NodePgDatabase) {
  return new SessionNoteManagementService(db)
}
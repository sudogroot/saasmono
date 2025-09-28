import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createSessionNoteManagementService } from '../../services/managment/sessionNotes'
import {
  CreateSessionNoteAttachmentInputSchema,
  CreateSessionNoteInputSchema,
  SessionNoteAttachmentSchema,
  SessionNoteListItemSchema,
  SessionNoteQuerySchema,
  SessionNoteSchema,
  UpdateSessionNoteInputSchema
} from '../../types/sessionNote'

const sessionNoteService = createSessionNoteManagementService(db)

export const sessionNoteManagementRouter = {
  // Session Notes
  getSessionNotesList: protectedProcedure
    .input(SessionNoteQuerySchema.optional())
    .output(z.array(SessionNoteListItemSchema))
    .route({
      method: 'GET',
      path: '/management/session-notes',
      tags: ['Session Note Management'],
      summary: 'List session notes',
      description: 'Retrieves all session notes with optional filtering',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await sessionNoteService.getSessionNotesList(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session notes')
      }
    }),

  getSessionNoteById: protectedProcedure
    .input(
      z.object({
        sessionNoteId: z.uuid().describe('Session Note ID'),
      })
    )
    .output(SessionNoteSchema)
    .route({
      method: 'GET',
      path: '/management/session-notes/{sessionNoteId}',
      tags: ['Session Note Management'],
      summary: 'Get session note',
      description: 'Retrieves a single session note by ID with attachments',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await sessionNoteService.getSessionNoteById(input.sessionNoteId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session note')
      }
    }),

  createSessionNote: protectedProcedure
    .input(CreateSessionNoteInputSchema)
    .output(SessionNoteSchema.omit({
      timetable: true,
      attachments: true,
    }))
    .route({
      method: 'POST',
      path: '/management/session-notes',
      tags: ['Session Note Management'],
      summary: 'Create session note',
      description: 'Creates a new session note',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await sessionNoteService.createSessionNote(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create session note')
      }
    }),

  updateSessionNote: protectedProcedure
    .input(
      z.object({
        sessionNoteId: z.uuid().describe('Session Note ID'),
        data: UpdateSessionNoteInputSchema,
      })
    )
    .output(SessionNoteSchema.omit({
      timetable: true,
      attachments: true,
    }))
    .route({
      method: 'PUT',
      path: '/management/session-notes/{sessionNoteId}',
      tags: ['Session Note Management'],
      summary: 'Update session note',
      description: 'Updates an existing session note',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await sessionNoteService.updateSessionNote(input.sessionNoteId, input.data, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update session note')
      }
    }),

  deleteSessionNote: protectedProcedure
    .input(
      z.object({
        sessionNoteId: z.uuid().describe('Session Note ID'),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .route({
      method: 'DELETE',
      path: '/management/session-notes/{sessionNoteId}',
      tags: ['Session Note Management'],
      summary: 'Delete session note',
      description: 'Deletes a session note (soft delete)',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await sessionNoteService.deleteSessionNote(input.sessionNoteId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete session note')
      }
    }),

  // Session Note Attachments
  createSessionNoteAttachment: protectedProcedure
    .input(CreateSessionNoteAttachmentInputSchema)
    .output(SessionNoteAttachmentSchema)
    .route({
      method: 'POST',
      path: '/management/session-note-attachments',
      tags: ['Session Note Management'],
      summary: 'Create session note attachment',
      description: 'Creates a new attachment for a session note',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await sessionNoteService.createSessionNoteAttachment(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create session note attachment')
      }
    }),

  deleteSessionNoteAttachment: protectedProcedure
    .input(
      z.object({
        attachmentId: z.uuid().describe('Attachment ID'),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .route({
      method: 'DELETE',
      path: '/management/session-note-attachments/{attachmentId}',
      tags: ['Session Note Management'],
      summary: 'Delete session note attachment',
      description: 'Deletes a session note attachment (soft delete)',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await sessionNoteService.deleteSessionNoteAttachment(input.attachmentId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete session note attachment')
      }
    }),
}
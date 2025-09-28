import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createTimetableManagementService } from '../../services/managment/timetable'
import {
  CreateTimetableInputSchema,
  TimetableListItemSchema,
  TimetableQuerySchema,
  TimetableSchema,
  UpdateTimetableInputSchema
} from '../../types/timetable'

const timetableService = createTimetableManagementService(db)

export const timetableManagementRouter = {
  // Session Instances
  getTimetablesList: protectedProcedure
    .input(TimetableQuerySchema.optional())
    .output(z.array(TimetableListItemSchema))
    .route({
      method: 'GET',
      path: '/management/session-instances',
      tags: ['Session Instance Management'],
      summary: 'List session instances',
      description: 'Retrieves all session instances with optional filtering',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await timetableService.getTimetablesList(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session instances')
      }
    }),

  getTimetableById: protectedProcedure
    .input(
      z.object({
        timetableId: z.uuid().describe('Session Instance ID'),
      })
    )
    .output(TimetableSchema)
    .route({
      method: 'GET',
      path: '/management/session-instances/{timetableId}',
      tags: ['Session Instance Management'],
      summary: 'Get session instance',
      description: 'Retrieves a single session instance by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await timetableService.getTimetableById(input.timetableId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session instance')
      }
    }),

  createTimetable: protectedProcedure
    .input(CreateTimetableInputSchema)
    .output(TimetableSchema.omit({
      teacher: true,
      educationSubject: true,
      room: true,
      classroom: true,
      classroomGroup: true,
    }))
    .route({
      method: 'POST',
      path: '/management/session-instances',
      tags: ['Session Instance Management'],
      summary: 'Create session instance',
      description: 'Creates a new session instance',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await timetableService.createTimetable(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create session instance')
      }
    }),

  updateTimetable: protectedProcedure
    .input(
      z.object({
        timetableId: z.uuid().describe('Session Instance ID'),
        data: UpdateTimetableInputSchema,
      })
    )
    .output(TimetableSchema.omit({
      teacher: true,
      educationSubject: true,
      room: true,
      classroom: true,
      classroomGroup: true,
    }))
    .route({
      method: 'PUT',
      path: '/management/session-instances/{timetableId}',
      tags: ['Session Instance Management'],
      summary: 'Update session instance',
      description: 'Updates an existing session instance',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await timetableService.updateTimetable(input.timetableId, input.data, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update session instance')
      }
    }),

  deleteTimetable: protectedProcedure
    .input(
      z.object({
        timetableId: z.uuid().describe('Session Instance ID'),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .route({
      method: 'DELETE',
      path: '/management/session-instances/{timetableId}',
      tags: ['Session Instance Management'],
      summary: 'Delete session instance',
      description: 'Deletes a session instance (soft delete)',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await timetableService.deleteTimetable(input.timetableId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete session instance')
      }
    }),
}
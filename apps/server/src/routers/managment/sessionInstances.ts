import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createSessionInstanceManagementService } from '../../services/managment/sessionInstances'
import {
  CreateSessionInstanceInputSchema,
  SessionInstanceListItemSchema,
  SessionInstanceQuerySchema,
  SessionInstanceSchema,
  UpdateSessionInstanceInputSchema
} from '../../types/sessionInstance'

const sessionInstanceService = createSessionInstanceManagementService(db)

export const sessionInstanceManagementRouter = {
  // Session Instances
  getSessionInstancesList: protectedProcedure
    .input(SessionInstanceQuerySchema.optional())
    .output(z.array(SessionInstanceListItemSchema))
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
        return await sessionInstanceService.getSessionInstancesList(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session instances')
      }
    }),

  getSessionInstanceById: protectedProcedure
    .input(
      z.object({
        sessionInstanceId: z.uuid().describe('Session Instance ID'),
      })
    )
    .output(SessionInstanceSchema)
    .route({
      method: 'GET',
      path: '/management/session-instances/{sessionInstanceId}',
      tags: ['Session Instance Management'],
      summary: 'Get session instance',
      description: 'Retrieves a single session instance by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await sessionInstanceService.getSessionInstanceById(input.sessionInstanceId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session instance')
      }
    }),

  createSessionInstance: protectedProcedure
    .input(CreateSessionInstanceInputSchema)
    .output(SessionInstanceSchema.omit({
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
        return await sessionInstanceService.createSessionInstance(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create session instance')
      }
    }),

  updateSessionInstance: protectedProcedure
    .input(
      z.object({
        sessionInstanceId: z.uuid().describe('Session Instance ID'),
        data: UpdateSessionInstanceInputSchema,
      })
    )
    .output(SessionInstanceSchema.omit({
      teacher: true,
      educationSubject: true,
      room: true,
      classroom: true,
      classroomGroup: true,
    }))
    .route({
      method: 'PUT',
      path: '/management/session-instances/{sessionInstanceId}',
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
        return await sessionInstanceService.updateSessionInstance(input.sessionInstanceId, input.data, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update session instance')
      }
    }),

  deleteSessionInstance: protectedProcedure
    .input(
      z.object({
        sessionInstanceId: z.uuid().describe('Session Instance ID'),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .route({
      method: 'DELETE',
      path: '/management/session-instances/{sessionInstanceId}',
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
        return await sessionInstanceService.deleteSessionInstance(input.sessionInstanceId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete session instance')
      }
    }),
}
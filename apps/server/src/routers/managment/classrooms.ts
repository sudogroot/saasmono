import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createClassroomManagementService } from '../../services/managment/classrooms'
import { ClassroomGroupListItemSchema, ClassroomListItemSchema, ClassroomSchema } from '../../types/classroom'

const classroomService = createClassroomManagementService(db)

export const classroomManagementRouter = {
  // Classrooms
  getClassroomsList: protectedProcedure
    .input(
      z.object({
        search: z.string().optional().describe('Search term to filter classrooms by name, education level, or academic year'),
      }).optional()
    )
    .output(z.array(ClassroomListItemSchema))
    .route({
      method: 'GET',
      path: '/management/classrooms',
      tags: ['Classroom Management'],
      summary: 'List classrooms',
      description: 'Retrieves all classrooms with their education levels and student/teacher counts',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await classroomService.getClassroomsList(orgId, input?.search)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch classrooms')
      }
    }),

  getClassroomById: protectedProcedure
    .input(
      z.object({
        classroomId: z.uuid().describe('Classroom ID'),
      })
    )
    .output(ClassroomSchema)
    .route({
      method: 'GET',
      path: '/management/classrooms/{classroomId}',
      tags: ['Classroom Management'],
      summary: 'Get classroom',
      description: 'Retrieves a single classroom with its education level and counts',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await classroomService.getClassroomById(input.classroomId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch classroom')
      }
    }),

  getClassroomGroupsList: protectedProcedure
    .input(
      z.object({
        search: z.string().optional().describe('Search term to filter classroom groups by name, classroom name, or academic year'),
      }).optional()
    )
    .output(z.array(ClassroomGroupListItemSchema))
    .route({
      method: 'GET',
      path: '/management/classroom-groups',
      tags: ['Classroom Management'],
      summary: 'List classroom groups',
      description: 'Retrieves all classroom groups with their associated classroom information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await classroomService.getClassroomGroupsList(orgId, input?.search)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch classroom groups')
      }
    }),
}

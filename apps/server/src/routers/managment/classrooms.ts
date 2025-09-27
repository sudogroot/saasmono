import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createClassroomManagementService } from '../../services/managment/classrooms'
import { ClassroomListItemSchema, ClassroomSchema } from '../../types/classroom'

const classroomService = createClassroomManagementService(db)

export const classroomManagementRouter = {
  // Classrooms
  getClassroomsList: protectedProcedure
    .output(z.array(ClassroomListItemSchema))
    .route({
      method: 'GET',
      path: '/management/classrooms',
      tags: ['Classroom Management'],
      summary: 'List classrooms',
      description: 'Retrieves all classrooms with their education levels and student/teacher counts',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await classroomService.getClassroomsList(orgId)
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
}

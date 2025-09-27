import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createTeacherManagementService } from '../../services/managment/teachers'
import {
  CreateTeacherAssignmentSchema,
  SuccessResponseSchema,
  TeacherAssignmentSchema,
  TeacherWithAssignmentsSchema,
} from '../../types/user'

const teacherService = createTeacherManagementService(db)

export const teacherManagementRouter = {
  getTeachersList: protectedProcedure
    .output(z.array(TeacherWithAssignmentsSchema))
    .route({
      method: 'GET',
      path: '/management/teachers/list',
      tags: ['Teacher Management'],
      summary: 'List teachers with assignments',
      description: 'Retrieves teachers with their classroom and subject assignments',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await teacherService.getTeachersList(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch teachers')
      }
    }),

  createTeacherAssignment: protectedProcedure
    .input(CreateTeacherAssignmentSchema)
    .output(TeacherAssignmentSchema)
    .route({
      method: 'POST',
      path: '/management/teacher-assignments',
      tags: ['Teacher Management'],
      summary: 'Create teacher assignment',
      description: 'Assigns teacher to subject and education level',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await teacherService.createTeacherAssignment(orgId, {
          ...input,
          createdByUserId: currentUserId,
        })
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create assignment')
      }
    }),

  updateTeacherAssignment: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string().uuid().describe('Assignment ID'),
        educationSubjectId: z.string().uuid().optional(),
        educationLevelId: z.string().uuid().optional(),
      })
    )
    .output(TeacherAssignmentSchema)
    .route({
      method: 'PUT',
      path: '/management/teacher-assignments/{assignmentId}',
      tags: ['Teacher Management'],
      summary: 'Update teacher assignment',
      description: "Updates teacher's subject and/or education level assignment",
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      const { assignmentId, ...updateData } = input
      try {
        return await teacherService.updateTeacherAssignment(orgId, assignmentId, {
          ...updateData,
          createdByUserId: currentUserId,
        })
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update assignment')
      }
    }),

  deleteTeacherAssignment: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string().uuid().describe('Assignment ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/management/teacher-assignments/{assignmentId}',
      tags: ['Teacher Management'],
      summary: 'Delete teacher assignment',
      description: 'Soft deletes teacher assignment',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await teacherService.deleteTeacherAssignment(orgId, input.assignmentId, currentUserId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete assignment')
      }
    }),
}
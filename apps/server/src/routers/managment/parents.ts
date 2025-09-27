import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createParentManagementService } from '../../services/managment/parents'
import {
  CreateParentStudentRelationSchema,
  ParentStudentRelationSchema,
  ParentWithChildrenSchema,
  ParentDetailedResponseSchema,
  SuccessResponseSchema,
  UpdateParentStudentRelationSchema,
} from '../../types/user'

const parentService = createParentManagementService(db)

export const parentManagementRouter = {
  getParentsList: protectedProcedure
    .output(z.array(ParentWithChildrenSchema))
    .route({
      method: 'GET',
      path: '/management/parents/list',
      tags: ['Parent Management'],
      summary: 'List parents with children',
      description: 'Retrieves parents with their children (students) information',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await parentService.getParentsList(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch parents')
      }
    }),

  getParentById: protectedProcedure
    .input(
      z.object({
        parentId: z.string().describe('Parent ID'),
      })
    )
    .output(ParentDetailedResponseSchema)
    .route({
      method: 'GET',
      path: '/management/parents/{parentId}',
      tags: ['Parent Management'],
      summary: 'Get detailed parent information',
      description: 'Retrieves comprehensive parent details including all children information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await parentService.getParentById(input.parentId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch parent details')
      }
    }),

  createParentStudentRelation: protectedProcedure
    .input(CreateParentStudentRelationSchema)
    .output(ParentStudentRelationSchema)
    .route({
      method: 'POST',
      path: '/management/parent-student-relations',
      tags: ['Parent Management'],
      summary: 'Create parent-student relation',
      description: 'Creates a new parent-student relationship',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await parentService.createParentStudentRelation(orgId, {
          ...input,
          createdByUserId: currentUserId,
        })
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create parent-student relation')
      }
    }),

  updateParentStudentRelation: protectedProcedure
    .input(UpdateParentStudentRelationSchema)
    .output(ParentStudentRelationSchema)
    .route({
      method: 'PUT',
      path: '/management/parent-student-relations/{relationId}',
      tags: ['Parent Management'],
      summary: 'Update parent-student relation',
      description: 'Updates a parent-student relationship',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      const { relationId, ...updateData } = input
      try {
        return await parentService.updateParentStudentRelation(orgId, relationId, {
          ...updateData,
          createdByUserId: currentUserId,
        })
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update parent-student relation')
      }
    }),

  deleteParentStudentRelation: protectedProcedure
    .input(
      z.object({
        relationId: z.uuid().describe('Relation ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/management/parent-student-relations/{relationId}',
      tags: ['Parent Management'],
      summary: 'Delete parent-student relation',
      description: 'Deletes a parent-student relationship',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await parentService.deleteParentStudentRelation(orgId, input.relationId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete parent-student relation')
      }
    }),
}
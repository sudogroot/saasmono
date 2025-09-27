import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createUserManagementService } from '../../services/managment/users'
import {
  CreateParentStudentRelationSchema,
  ParentStudentRelationSchema,
  SuccessResponseSchema,
  UserListItemSchema,
  UserResponseSchema,
  UserTypeSchema,
  UserUpdateSchema,
} from '../../types/user'

const userService = createUserManagementService(db)

export const userManagementRouter = {
  getUserById: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).describe('User ID'),
      })
    )
    .output(UserResponseSchema)
    .route({
      method: 'GET',
      path: '/management/users/{userId}',
      tags: ['User Management'],
      summary: 'Get user with relationships',
      description: 'Retrieves user details including parent-children relationships and teacher assignments',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await userService.getUserById(input.userId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch user')
      }
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1).describe('User ID'),
        name: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        userType: UserTypeSchema.optional(),
      })
    )
    .output(UserUpdateSchema)
    .route({
      method: 'PUT',
      path: '/management/users/{userId}',
      tags: ['User Management'],
      summary: 'Update user',
      description: "Updates user's basic information",
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const { userId, ...updateData } = input
      try {
        return await userService.updateUser(userId, orgId, updateData)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update user')
      }
    }),

  listUsers: protectedProcedure
    .input(
      z.object({
        userType: UserTypeSchema.optional(),
      })
    )
    .output(z.array(UserListItemSchema))
    .route({
      method: 'GET',
      path: '/management/users',
      tags: ['User Management'],
      summary: 'List users',
      description: 'Retrieves users, optionally filtered by type',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await userService.listUsersByType(orgId, input.userType)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch users')
      }
    }),


  createParentStudentRelation: protectedProcedure
    .input(CreateParentStudentRelationSchema)
    .output(ParentStudentRelationSchema)
    .route({
      method: 'POST',
      path: '/management/parent-student-relations',
      tags: ['User Management'],
      summary: 'Create parent-student relation',
      description: 'Creates relationship between parent and student',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await userService.createParentStudentRelation(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create relation')
      }
    }),

  deleteParentStudentRelation: protectedProcedure
    .input(
      z.object({
        relationId: z.string().uuid().describe('Relation ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/management/parent-student-relations/{relationId}',
      tags: ['User Management'],
      summary: 'Delete parent-student relation',
      description: 'Removes parent-student relationship',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await userService.deleteParentStudentRelation(orgId, input.relationId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete relation')
      }
    }),

}

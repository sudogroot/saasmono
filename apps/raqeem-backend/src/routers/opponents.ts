import { z } from 'zod'
import { db } from '../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { createOpponentService } from '../services/opponents'
import {
  CreateOpponentSchema,
  OpponentDropdownItemSchema,
  UpdateOpponentSchema,
  OpponentSchema,
  OpponentListItemSchema,
  SuccessResponseSchema,
} from '../types/opponent'

const opponentService = createOpponentService(db)

export const opponentRouter = {
  createOpponent: protectedProcedure
    .input(CreateOpponentSchema)
    .output(OpponentSchema)
    .route({
      method: 'POST',
      path: '/opponents',
      tags: ['Opponents'],
      summary: 'Create opponent',
      description: 'Creates a new opponent',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await opponentService.createOpponent(orgId, userId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create opponent')
      }
    }),

  getOpponentById: protectedProcedure
    .input(
      z.object({
        opponentId: z.string().min(1).describe('Opponent ID'),
      })
    )
    .output(OpponentSchema)
    .route({
      method: 'GET',
      path: '/opponents/{opponentId}',
      tags: ['Opponents'],
      summary: 'Get opponent by ID',
      description: 'Retrieves an opponent by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await opponentService.getOpponentById(input.opponentId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch opponent')
      }
    }),

  updateOpponent: protectedProcedure
    .input(
      z.object({
        opponentId: z.string().min(1).describe('Opponent ID'),
      }).merge(UpdateOpponentSchema)
    )
    .output(OpponentSchema)
    .route({
      method: 'PUT',
      path: '/opponents/{opponentId}',
      tags: ['Opponents'],
      summary: 'Update opponent',
      description: 'Updates opponent information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      const { opponentId, ...updateData } = input
      try {
        return await opponentService.updateOpponent(opponentId, orgId, userId, updateData)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update opponent')
      }
    }),

  deleteOpponent: protectedProcedure
    .input(
      z.object({
        opponentId: z.string().min(1).describe('Opponent ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/opponents/{opponentId}',
      tags: ['Opponents'],
      summary: 'Delete opponent',
      description: 'Soft deletes an opponent',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await opponentService.deleteOpponent(input.opponentId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete opponent')
      }
    }),

  listOpponents: protectedProcedure
    .output(z.array(OpponentListItemSchema))
    .route({
      method: 'GET',
      path: '/opponents',
      tags: ['Opponents'],
      summary: 'List opponents',
      description: 'Retrieves all opponents for the organization',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await opponentService.listOpponents(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch opponents')
      }
    }),

  getOpponentsForDropdown: protectedProcedure
    .output(z.array(OpponentDropdownItemSchema))
    .route({
      method: 'GET',
      path: '/opponents/dropdown',
      tags: ['Opponents'],
      summary: 'Get opponents for dropdown',
      description: 'Retrieves simplified opponent data for dropdowns (id, name, type)',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await opponentService.getOpponentsForDropdown(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch opponents for dropdown')
      }
    }),
}
import { z } from 'zod'
import { db } from '../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { createTrialService } from '../services/trials'
import {
  CreateTrialSchema,
  UpdateTrialSchema,
  TrialSchema,
  TrialWithRelationsSchema,
  TrialListItemSchema,
  SuccessResponseSchema,
} from '../types/trial'

const trialService = createTrialService(db)

export const trialRouter = {
  createTrial: protectedProcedure
    .input(CreateTrialSchema)
    .output(TrialSchema)
    .route({
      method: 'POST',
      path: '/trials',
      tags: ['Trials'],
      summary: 'Create trial',
      description: 'Creates a new trial',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await trialService.createTrial(orgId, userId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create trial')
      }
    }),

  getTrialById: protectedProcedure
    .input(
      z.object({
        trialId: z.string().min(1).describe('Trial ID'),
      })
    )
    .output(TrialWithRelationsSchema)
    .route({
      method: 'GET',
      path: '/trials/{trialId}',
      tags: ['Trials'],
      summary: 'Get trial by ID',
      description: 'Retrieves a trial by ID with related client, court, opponent, and lawyer information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await trialService.getTrialById(input.trialId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch trial')
      }
    }),

  updateTrial: protectedProcedure
    .input(
      z.object({
        trialId: z.string().min(1).describe('Trial ID'),
      }).merge(UpdateTrialSchema)
    )
    .output(TrialSchema)
    .route({
      method: 'PUT',
      path: '/trials/{trialId}',
      tags: ['Trials'],
      summary: 'Update trial',
      description: 'Updates trial information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      const { trialId, ...updateData } = input
      try {
        return await trialService.updateTrial(trialId, orgId, userId, updateData)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update trial')
      }
    }),

  deleteTrial: protectedProcedure
    .input(
      z.object({
        trialId: z.string().min(1).describe('Trial ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/trials/{trialId}',
      tags: ['Trials'],
      summary: 'Delete trial',
      description: 'Soft deletes a trial',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await trialService.deleteTrial(input.trialId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete trial')
      }
    }),

  listTrials: protectedProcedure
    .output(z.array(TrialListItemSchema))
    .route({
      method: 'GET',
      path: '/trials',
      tags: ['Trials'],
      summary: 'List trials',
      description: 'Retrieves all trials for the organization',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await trialService.listTrials(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch trials')
      }
    }),
}
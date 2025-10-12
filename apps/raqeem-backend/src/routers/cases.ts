import { z } from 'zod'
import { db } from '../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { createCaseService } from '../services/cases'
import {
  CaseListItemSchema,
  CaseSchema,
  CaseWithRelationsSchema,
  CreateCaseSchema,
  SuccessResponseSchema,
  UpdateCaseSchema,
} from '../types/case'

const caseService = createCaseService(db)

export const caseRouter = {
  createCase: protectedProcedure
    .input(CreateCaseSchema)
    .output(CaseSchema)
    .route({
      method: 'POST',
      path: '/cases',
      tags: ['Cases'],
      summary: 'Create case',
      description: 'Creates a new case',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)

      console.log('[CREATE CASE] Request received:', {
        orgId,
        userId,
        input: JSON.stringify(input, null, 2),
      })

      try {
        const result = await caseService.createCase(orgId, userId, input)
        console.log('[CREATE CASE] Success:', { caseId: result.id })
        return result
      } catch (error) {
        console.error('[CREATE CASE] Error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error: error,
          input: JSON.stringify(input, null, 2),
        })
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create case')
      }
    }),

  getCaseById: protectedProcedure
    .input(
      z.object({
        caseId: z.string().min(1).describe('Case ID'),
      })
    )
    .output(CaseWithRelationsSchema)
    .route({
      method: 'GET',
      path: '/cases/{caseId}',
      tags: ['Cases'],
      summary: 'Get case by ID',
      description: 'Retrieves a case by ID with related data',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await caseService.getCaseById(input.caseId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch case')
      }
    }),

  updateCase: protectedProcedure
    .input(
      z
        .object({
          caseId: z.string().min(1).describe('Case ID'),
        })
        .merge(UpdateCaseSchema)
    )
    .output(CaseSchema)
    .route({
      method: 'PUT',
      path: '/cases/{caseId}',
      tags: ['Cases'],
      summary: 'Update case',
      description: 'Updates case information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      const { caseId, ...updateData } = input
      try {
        return await caseService.updateCase(caseId, orgId, userId, updateData)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update case')
      }
    }),

  deleteCase: protectedProcedure
    .input(
      z.object({
        caseId: z.string().min(1).describe('Case ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/cases/{caseId}',
      tags: ['Cases'],
      summary: 'Delete case',
      description: 'Soft deletes a case',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await caseService.deleteCase(input.caseId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete case')
      }
    }),

  listCases: protectedProcedure
    .output(z.array(CaseListItemSchema))
    .route({
      method: 'GET',
      path: '/cases',
      tags: ['Cases'],
      summary: 'List cases',
      description: 'Retrieves all cases for the organization',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await caseService.listCases(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch cases')
      }
    }),
}

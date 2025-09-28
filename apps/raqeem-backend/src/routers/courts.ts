import { z } from 'zod'
import { db } from '../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { createCourtService } from '../services/courts'
import {
  CourtsByStateSchema,
  CreateCourtSchema,
  UpdateCourtSchema,
  CourtSchema,
  CourtListItemSchema,
  SuccessResponseSchema,
} from '../types/court'

const courtService = createCourtService(db)

export const courtRouter = {
  createCourt: protectedProcedure
    .input(CreateCourtSchema)
    .output(CourtSchema)
    .route({
      method: 'POST',
      path: '/courts',
      tags: ['Courts'],
      summary: 'Create court',
      description: 'Creates a new court',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await courtService.createCourt(orgId, userId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create court')
      }
    }),

  getCourtById: protectedProcedure
    .input(
      z.object({
        courtId: z.string().min(1).describe('Court ID'),
      })
    )
    .output(CourtSchema)
    .route({
      method: 'GET',
      path: '/courts/{courtId}',
      tags: ['Courts'],
      summary: 'Get court by ID',
      description: 'Retrieves a court by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await courtService.getCourtById(input.courtId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch court')
      }
    }),

  updateCourt: protectedProcedure
    .input(
      z.object({
        courtId: z.string().min(1).describe('Court ID'),
      }).merge(UpdateCourtSchema)
    )
    .output(CourtSchema)
    .route({
      method: 'PUT',
      path: '/courts/{courtId}',
      tags: ['Courts'],
      summary: 'Update court',
      description: 'Updates court information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      const { courtId, ...updateData } = input
      try {
        return await courtService.updateCourt(courtId, orgId, updateData)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update court')
      }
    }),

  deleteCourt: protectedProcedure
    .input(
      z.object({
        courtId: z.string().min(1).describe('Court ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/courts/{courtId}',
      tags: ['Courts'],
      summary: 'Delete court',
      description: 'Soft deletes a court',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await courtService.deleteCourt(input.courtId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete court')
      }
    }),

  listCourts: protectedProcedure
    .output(z.array(CourtListItemSchema))
    .route({
      method: 'GET',
      path: '/courts',
      tags: ['Courts'],
      summary: 'List courts',
      description: 'Retrieves all courts for the organization',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await courtService.listCourts(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch courts')
      }
    }),

  getCourtsForDropdown: protectedProcedure
    .output(z.array(CourtsByStateSchema))
    .route({
      method: 'GET',
      path: '/courts/dropdown',
      tags: ['Courts'],
      summary: 'Get courts for dropdown',
      description: 'Retrieves courts grouped by state for dropdowns (state, courts with id and name)',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await courtService.getCourtsForDropdown()
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch courts for dropdown')
      }
    }),
}
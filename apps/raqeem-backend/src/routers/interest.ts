import { db } from '../db/index'
import { OrpcErrorHelper } from '../lib/errors/orpc-errors'
import { publicProcedure } from '../lib/orpc'
import { createInterestService } from '../services/interest'
import {
  CreateInterestRequestSchema,
  InterestRequestSchema,
  SuccessResponseSchema,
} from '../types/interest'

const interestService = createInterestService(db)

export const interestRouter = {
  createInterestRequest: publicProcedure
    .input(CreateInterestRequestSchema)
    .output(SuccessResponseSchema)
    .route({
      method: 'POST',
      path: '/interest',
      tags: ['Interest'],
      summary: 'Submit interest/demo request',
      description: 'Creates a new interest request for early access or demo',
    })
    .handler(async ({ input }) => {
      try {
        await interestService.createInterestRequest(input)
        return {
          success: true,
          message: 'شكراً لاهتمامك! سنتواصل معك قريباً',
        }
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create interest request')
      }
    }),
}

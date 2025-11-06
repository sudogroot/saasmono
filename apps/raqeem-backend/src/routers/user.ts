import { db } from '../db/index'
import { user } from '../db/schema/auth'
import { OrpcErrorHelper } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export const userRouter = {
  completePasswordChange: protectedProcedure
    .output(SuccessResponseSchema)
    .route({
      method: 'POST',
      path: '/user/complete-password-change',
      tags: ['User'],
      summary: 'Mark password change as completed',
      description: 'Updates the user to indicate they have completed the required password change',
    })
    .handler(async ({ context }) => {
      try {
        const userId = context.session?.user?.id

        if (!userId) {
          throw new Error('Unauthorized: No user ID in session')
        }

        // Update passwordChangeRequired to false
        await db
          .update(user)
          .set({
            passwordChangeRequired: false,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId))

        return {
          success: true,
          message: 'Password change requirement cleared successfully'
        }
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to complete password change')
      }
    }),
}

import type { RouterClient } from '@orpc/server'
import { protectedProcedure, publicProcedure } from '../lib/orpc'
import { caseRouter } from './cases'
import { clientRouter } from './clients'
import { courtRouter } from './courts'
import { dashboardRouter } from './dashboard'
import { opponentRouter } from './opponents'
import { trialRouter } from './trials'

export const appRouter = {
  healthCheck: publicProcedure
    .route({
      method: 'GET',
      path: '/health',
      tags: ['Health'],
      summary: 'Health check',
      description: 'Returns the health status of the API server',
    })
    .handler(() => {
      return 'OK'
    }),
  privateData: protectedProcedure
    .route({
      method: 'GET',
      path: '/private',
      tags: ['Health'],
      summary: 'Private data endpoint',
      description: 'Returns private data accessible only to authenticated users',
    })
    .handler(({ context }) => {
      return {
        message: 'This is private',
        user: context.session?.user,
      }
    }),

  // Legal management routes
  cases: caseRouter,
  clients: clientRouter,
  courts: courtRouter,
  opponents: opponentRouter,
  trials: trialRouter,
  dashboard: dashboardRouter,
}

export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
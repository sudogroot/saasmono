import { z } from 'zod'
import { db } from '../db/index'
import { OrpcErrorHelper, getOrgId } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { createDashboardService } from '../services/dashboard'
import {
  CaseListItemDashboardSchema,
  ClientListItemDashboardSchema,
  DashboardDataSchema,
  DashboardStatsSchema,
  TrialListItemSchema,
} from '../types/dashboard'

const dashboardService = createDashboardService(db)

export const dashboardRouter = {
  getDashboardData: protectedProcedure
    .output(DashboardDataSchema)
    .route({
      method: 'GET',
      path: '/dashboard',
      tags: ['Dashboard'],
      summary: 'Get dashboard data',
      description: 'Retrieves all dashboard data including stats, trials, cases, and clients',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        const [stats, todayTrials, tomorrowTrials, upcomingTrials, recentTrials, latestCases, latestClients] =
          await Promise.all([
            dashboardService.getStats(orgId),
            dashboardService.getTodayTrials(orgId),
            dashboardService.getTomorrowTrials(orgId),
            dashboardService.getUpcomingTrials(orgId, 10),
            dashboardService.getRecentTrials(orgId, 5),
            dashboardService.getLatestCases(orgId, 5),
            dashboardService.getLatestClients(orgId, 5),
          ])

        return {
          stats,
          todayTrials,
          tomorrowTrials,
          upcomingTrials,
          recentTrials,
          latestCases,
          latestClients,
        }
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch dashboard data')
      }
    }),

  getStats: protectedProcedure
    .output(DashboardStatsSchema)
    .route({
      method: 'GET',
      path: '/dashboard/stats',
      tags: ['Dashboard'],
      summary: 'Get dashboard stats',
      description: 'Retrieves dashboard statistics',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getStats(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch dashboard stats')
      }
    }),

  getTodayTrials: protectedProcedure
    .output(z.array(TrialListItemSchema))
    .route({
      method: 'GET',
      path: '/dashboard/today-trials',
      tags: ['Dashboard'],
      summary: 'Get today trials',
      description: "Retrieves trials scheduled for today",
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getTodayTrials(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch today trials')
      }
    }),

  getTomorrowTrials: protectedProcedure
    .output(z.array(TrialListItemSchema))
    .route({
      method: 'GET',
      path: '/dashboard/tomorrow-trials',
      tags: ['Dashboard'],
      summary: 'Get tomorrow trials',
      description: "Retrieves trials scheduled for tomorrow",
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getTomorrowTrials(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch tomorrow trials')
      }
    }),

  getUpcomingTrials: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(10),
      })
    )
    .output(z.array(TrialListItemSchema))
    .route({
      method: 'GET',
      path: '/dashboard/upcoming-trials',
      tags: ['Dashboard'],
      summary: 'Get upcoming trials',
      description: 'Retrieves upcoming trials',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getUpcomingTrials(orgId, input.limit)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch upcoming trials')
      }
    }),

  getRecentTrials: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(10),
      })
    )
    .output(z.array(TrialListItemSchema))
    .route({
      method: 'GET',
      path: '/dashboard/recent-trials',
      tags: ['Dashboard'],
      summary: 'Get recent trials',
      description: 'Retrieves recently completed trials',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getRecentTrials(orgId, input.limit)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch recent trials')
      }
    }),

  getLatestCases: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(5),
      })
    )
    .output(z.array(CaseListItemDashboardSchema))
    .route({
      method: 'GET',
      path: '/dashboard/latest-cases',
      tags: ['Dashboard'],
      summary: 'Get latest cases',
      description: 'Retrieves recently added cases',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getLatestCases(orgId, input.limit)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch latest cases')
      }
    }),

  getLatestClients: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(5),
      })
    )
    .output(z.array(ClientListItemDashboardSchema))
    .route({
      method: 'GET',
      path: '/dashboard/latest-clients',
      tags: ['Dashboard'],
      summary: 'Get latest clients',
      description: 'Retrieves recently added clients',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await dashboardService.getLatestClients(orgId, input.limit)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch latest clients')
      }
    }),
}

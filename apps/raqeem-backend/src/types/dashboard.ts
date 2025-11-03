import { z } from 'zod'

// Dashboard Stats Schema
export const DashboardStatsSchema = z.object({
  totalCases: z.number(),
  activeCases: z.number(),
  totalClients: z.number(),
  totalTrialsThisMonth: z.number(),
  upcomingTrials: z.number(),
})

// Trial List Item Schema for Dashboard
export const TrialListItemSchema = z.object({
  id: z.string(),
  trialNumber: z.number(),
  trialDateTime: z.coerce.date(),
  court: z.object({
    id: z.string(),
    name: z.string(),
  }),
  case: z.object({
    id: z.string(),
    caseNumber: z.string(),
    caseTitle: z.string(),
    caseStatus: z.string(),
    priority: z.string(),
  }),
})

// Case List Item Schema for Dashboard
export const CaseListItemDashboardSchema = z.object({
  id: z.string(),
  caseNumber: z.string(),
  caseTitle: z.string(),
  caseSubject: z.string().nullable(),
  caseStatus: z.string(),
  priority: z.string(),
  clientName: z.string(),
  createdAt: z.coerce.date(),
})

// Client List Item Schema for Dashboard
export const ClientListItemDashboardSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  clientType: z.string(),
  createdAt: z.coerce.date(),
})

// Dashboard Data Schema - Complete dashboard response
export const DashboardDataSchema = z.object({
  stats: DashboardStatsSchema,
  todayTrials: z.array(TrialListItemSchema),
  tomorrowTrials: z.array(TrialListItemSchema),
  upcomingTrials: z.array(TrialListItemSchema),
  recentTrials: z.array(TrialListItemSchema),
  newTrials: z.array(TrialListItemSchema),
  latestCases: z.array(CaseListItemDashboardSchema),
  latestClients: z.array(ClientListItemDashboardSchema),
})

// Type exports
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type TrialListItem = z.infer<typeof TrialListItemSchema>
export type CaseListItemDashboard = z.infer<typeof CaseListItemDashboardSchema>
export type ClientListItemDashboard = z.infer<typeof ClientListItemDashboardSchema>
export type DashboardData = z.infer<typeof DashboardDataSchema>

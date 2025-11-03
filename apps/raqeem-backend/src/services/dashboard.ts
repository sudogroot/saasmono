import { and, count, desc, eq, gte, isNull, lt, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { cases } from '../db/schema/cases'
import { clients } from '../db/schema/clients'
import { courts } from '../db/schema/courts'
import { trials } from '../db/schema/trials'

export interface DashboardStats {
  totalCases: number
  activeCases: number
  totalClients: number
  totalTrialsThisMonth: number
  upcomingTrials: number
}

export interface TrialListItem {
  id: string
  trialNumber: number
  trialDateTime: Date
  court: {
    id: string
    name: string
  }
  case: {
    id: string
    caseNumber: string
    caseTitle: string
    caseStatus: string
    priority: string
  }
}

export interface CaseListItemDashboard {
  id: string
  caseNumber: string
  caseTitle: string
  caseSubject: string | null
  caseStatus: string
  priority: string
  clientName: string
  createdAt: Date
}

export interface ClientListItemDashboard {
  id: string
  name: string
  email: string | null
  phone: string | null
  clientType: string
  createdAt: Date
}

export class DashboardService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getStats(orgId: string): Promise<DashboardStats> {
    // Get total cases
    const totalCasesResult = await this.db
      .select({ count: count() })
      .from(cases)
      .where(and(eq(cases.organizationId, orgId), isNull(cases.deletedAt)))

    // Get active cases (not closed, won, or lost)
    const activeCasesResult = await this.db
      .select({ count: count() })
      .from(cases)
      .where(
        and(
          eq(cases.organizationId, orgId),
          isNull(cases.deletedAt),
          sql`${cases.caseStatus} NOT IN ('closed', 'won', 'lost', 'withdrawn')`
        )
      )

    // Get total clients
    const totalClientsResult = await this.db
      .select({ count: count() })
      .from(clients)
      .where(and(eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

    // Get trials this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const trialsThisMonthResult = await this.db
      .select({ count: count() })
      .from(trials)
      .where(
        and(
          eq(trials.organizationId, orgId),
          isNull(trials.deletedAt),
          gte(trials.trialDateTime, startOfMonth),
          lt(trials.trialDateTime, endOfMonth)
        )
      )

    // Get upcoming trials (from now)
    const upcomingTrialsResult = await this.db
      .select({ count: count() })
      .from(trials)
      .where(and(eq(trials.organizationId, orgId), isNull(trials.deletedAt), gte(trials.trialDateTime, now)))

    return {
      totalCases: totalCasesResult[0]?.count || 0,
      activeCases: activeCasesResult[0]?.count || 0,
      totalClients: totalClientsResult[0]?.count || 0,
      totalTrialsThisMonth: trialsThisMonthResult[0]?.count || 0,
      upcomingTrials: upcomingTrialsResult[0]?.count || 0,
    }
  }

  async getTodayTrials(orgId: string): Promise<TrialListItem[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const result = await this.db
      .select({
        id: trials.id,
        trialNumber: trials.trialNumber,
        trialDateTime: trials.trialDateTime,
        court: {
          id: courts.id,
          name: courts.name,
        },
        case: {
          id: cases.id,
          caseNumber: cases.caseNumber,
          caseTitle: cases.caseTitle,
          caseStatus: cases.caseStatus,
          priority: cases.priority,
        },
      })
      .from(trials)
      .innerJoin(courts, eq(trials.courtId, courts.id))
      .innerJoin(cases, eq(trials.caseId, cases.id))
      .where(
        and(
          eq(trials.organizationId, orgId),
          isNull(trials.deletedAt),
          isNull(cases.deletedAt),
          gte(trials.trialDateTime, today),
          lt(trials.trialDateTime, tomorrow)
        )
      )
      .orderBy(trials.trialDateTime)

    return result as TrialListItem[]
  }

  async getTomorrowTrials(orgId: string): Promise<TrialListItem[]> {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const result = await this.db
      .select({
        id: trials.id,
        trialNumber: trials.trialNumber,
        trialDateTime: trials.trialDateTime,
        court: {
          id: courts.id,
          name: courts.name,
        },
        case: {
          id: cases.id,
          caseNumber: cases.caseNumber,
          caseTitle: cases.caseTitle,
          caseStatus: cases.caseStatus,
          priority: cases.priority,
        },
      })
      .from(trials)
      .innerJoin(courts, eq(trials.courtId, courts.id))
      .innerJoin(cases, eq(trials.caseId, cases.id))
      .where(
        and(
          eq(trials.organizationId, orgId),
          isNull(trials.deletedAt),
          isNull(cases.deletedAt),
          gte(trials.trialDateTime, tomorrow),
          lt(trials.trialDateTime, dayAfterTomorrow)
        )
      )
      .orderBy(trials.trialDateTime)

    return result as TrialListItem[]
  }

  async getUpcomingTrials(orgId: string, limit: number = 10): Promise<TrialListItem[]> {
    const now = new Date()

    const result = await this.db
      .select({
        id: trials.id,
        trialNumber: trials.trialNumber,
        trialDateTime: trials.trialDateTime,
        court: {
          id: courts.id,
          name: courts.name,
        },
        case: {
          id: cases.id,
          caseNumber: cases.caseNumber,
          caseTitle: cases.caseTitle,
          caseStatus: cases.caseStatus,
          priority: cases.priority,
        },
      })
      .from(trials)
      .innerJoin(courts, eq(trials.courtId, courts.id))
      .innerJoin(cases, eq(trials.caseId, cases.id))
      .where(and(eq(trials.organizationId, orgId), isNull(trials.deletedAt), isNull(cases.deletedAt), gte(trials.trialDateTime, now)))
      .orderBy(trials.trialDateTime)
      .limit(limit)

    return result as TrialListItem[]
  }

  async getRecentTrials(orgId: string, limit: number = 10): Promise<TrialListItem[]> {
    const now = new Date()

    const result = await this.db
      .select({
        id: trials.id,
        trialNumber: trials.trialNumber,
        trialDateTime: trials.trialDateTime,
        court: {
          id: courts.id,
          name: courts.name,
        },
        case: {
          id: cases.id,
          caseNumber: cases.caseNumber,
          caseTitle: cases.caseTitle,
          caseStatus: cases.caseStatus,
          priority: cases.priority,
        },
      })
      .from(trials)
      .innerJoin(courts, eq(trials.courtId, courts.id))
      .innerJoin(cases, eq(trials.caseId, cases.id))
      .where(and(eq(trials.organizationId, orgId), isNull(trials.deletedAt), isNull(cases.deletedAt), lt(trials.trialDateTime, now)))
      .orderBy(desc(trials.trialDateTime))
      .limit(limit)

    return result as TrialListItem[]
  }

  async getLatestCases(orgId: string, limit: number = 5): Promise<CaseListItemDashboard[]> {
    const result = await this.db
      .select({
        id: cases.id,
        caseNumber: cases.caseNumber,
        caseTitle: cases.caseTitle,
        caseSubject: cases.caseSubject,
        caseStatus: cases.caseStatus,
        priority: cases.priority,
        clientName: clients.name,
        createdAt: cases.createdAt,
      })
      .from(cases)
      .innerJoin(clients, eq(cases.clientId, clients.id))
      .where(and(eq(cases.organizationId, orgId), isNull(cases.deletedAt), isNull(clients.deletedAt)))
      .orderBy(desc(cases.createdAt))
      .limit(limit)

    return result as CaseListItemDashboard[]
  }

  async getLatestClients(orgId: string, limit: number = 5): Promise<ClientListItemDashboard[]> {
    const result = await this.db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        clientType: clients.clientType,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .where(and(eq(clients.organizationId, orgId), isNull(clients.deletedAt)))
      .orderBy(desc(clients.createdAt))
      .limit(limit)

    return result as ClientListItemDashboard[]
  }

  async getNewTrials(orgId: string, limit: number = 10): Promise<TrialListItem[]> {
    const result = await this.db
      .select({
        id: trials.id,
        trialNumber: trials.trialNumber,
        trialDateTime: trials.trialDateTime,
        court: {
          id: courts.id,
          name: courts.name,
        },
        case: {
          id: cases.id,
          caseNumber: cases.caseNumber,
          caseTitle: cases.caseTitle,
          caseStatus: cases.caseStatus,
          priority: cases.priority,
        },
      })
      .from(trials)
      .innerJoin(courts, eq(trials.courtId, courts.id))
      .innerJoin(cases, eq(trials.caseId, cases.id))
      .where(and(eq(trials.organizationId, orgId), isNull(trials.deletedAt), isNull(cases.deletedAt)))
      .orderBy(desc(trials.createdAt))
      .limit(limit)

    return result as TrialListItem[]
  }
}

export function createDashboardService(db: NodePgDatabase) {
  return new DashboardService(db)
}

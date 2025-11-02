import { and, desc, eq, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member, user } from '../db/schema/auth'
import { cases } from '../db/schema/cases'
import { clients } from '../db/schema/clients'
import { courts } from '../db/schema/courts'
import { trials } from '../db/schema/trials'
import type {
  CreateTrialInput,
  TrialListItem,
  TrialResponse,
  TrialWithRelations,
  UpdateTrialInput,
} from '../types/trial'

export class TrialService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createTrial(orgId: string, userId: string, data: CreateTrialInput): Promise<TrialResponse> {
    try {
      // Verify user belongs to organization
      const usermemberhip = await this.db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))

      if (usermemberhip.length === 0) {
        throw new Error('User not found in organization')
      }

      // Verify case exists and belongs to organization
      const caseExists = await this.db
        .select()
        .from(cases)
        .where(and(eq(cases.id, data.caseId), eq(cases.organizationId, orgId), isNull(cases.deletedAt)))

      if (caseExists.length === 0) {
        throw new Error('Case not found')
      }

      // Verify court exists
      const courtExists = await this.db.select().from(courts).where(eq(courts.id, data.courtId))

      if (courtExists.length === 0) {
        throw new Error('Court not found')
      }

      // Auto-generate trial number (including soft-deleted trials in count)
      const existingTrials = await this.db
        .select({ trialNumber: trials.trialNumber })
        .from(trials)
        .where(eq(trials.caseId, data.caseId))
        .orderBy(desc(trials.trialNumber))
        .limit(1)

      const nextTrialNumber = existingTrials.length > 0 && existingTrials[0]
        ? existingTrials[0].trialNumber + 1
        : 1

      const [newTrial] = await this.db
        .insert(trials)
        .values({
          ...data,
          trialNumber: nextTrialNumber,
          organizationId: orgId,
          createdBy: userId,
        })
        .returning()

      if (!newTrial) {
        throw new Error('Failed to create trial')
      }

      return newTrial as TrialResponse
    } catch (error) {
      // Log the full error server-side
      console.error('[TRIAL SERVICE] Create trial error:', error)
      // Re-throw with a safe error message (error handler will catch database errors)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error // Safe error message
      }
      throw new Error('Failed to create trial')
    }
  }

  async getTrialById(trialId: string, orgId: string): Promise<TrialWithRelations> {
    try {
      const result = await this.db
        .select({
          trial: trials,
          case: {
            id: cases.id,
            caseNumber: cases.caseNumber,
            caseTitle: cases.caseTitle,
          },
          client: {
            id: clients.id,
            name: clients.name,
            email: clients.email,
            phone: clients.phone,
          },
          court: {
            id: courts.id,
            name: courts.name,
            state: courts.state,
            courtType: courts.courtType,
          },
          assignedLawyer: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(trials)
        .innerJoin(cases, eq(trials.caseId, cases.id))
        .innerJoin(clients, eq(cases.clientId, clients.id))
        .innerJoin(courts, eq(trials.courtId, courts.id))
        .leftJoin(user, eq(cases.createdBy, user.id))
        .where(and(eq(trials.id, trialId), eq(trials.organizationId, orgId), isNull(trials.deletedAt)))

      if (result.length === 0) {
        throw new Error('Trial not found')
      }

      const trialData = result[0]
      if (!trialData) {
        throw new Error('Trial data not found')
      }

      return {
        ...trialData.trial,
        case: trialData.case,
        client: trialData.client,
        court: trialData.court,
        assignedLawyer: trialData.assignedLawyer,
      } as TrialWithRelations
    } catch (error) {
      console.error('[TRIAL SERVICE] Get trial by ID error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to fetch trial')
    }
  }

  async updateTrial(trialId: string, orgId: string, userId: string, data: UpdateTrialInput): Promise<TrialResponse> {
    try {
      // Verify trial exists and belongs to organization
      const existingTrial = await this.db
        .select()
        .from(trials)
        .where(and(eq(trials.id, trialId), eq(trials.organizationId, orgId), isNull(trials.deletedAt)))

      if (existingTrial.length === 0) {
        throw new Error('Trial not found')
      }

      const [updatedTrial] = await this.db
        .update(trials)
        .set({
          ...data,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(trials.id, trialId))
        .returning()

      if (!updatedTrial) {
        throw new Error('Failed to update trial')
      }

      return updatedTrial as TrialResponse
    } catch (error) {
      console.error('[TRIAL SERVICE] Update trial error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to update trial')
    }
  }

  async deleteTrial(trialId: string, orgId: string, userId: string): Promise<{ success: boolean }> {
    try {
      // Verify trial exists and belongs to organization
      const existingTrial = await this.db
        .select()
        .from(trials)
        .where(and(eq(trials.id, trialId), eq(trials.organizationId, orgId), isNull(trials.deletedAt)))

      if (existingTrial.length === 0) {
        throw new Error('Trial not found')
      }

      // Soft delete
      await this.db
        .update(trials)
        .set({
          deletedBy: userId,
          deletedAt: new Date(),
        })
        .where(eq(trials.id, trialId))

      return { success: true }
    } catch (error) {
      console.error('[TRIAL SERVICE] Delete trial error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to delete trial')
    }
  }

  async listTrials(orgId: string): Promise<TrialListItem[]> {
    try {
      const result = await this.db
        .select({
          id: trials.id,
          trialNumber: trials.trialNumber,
          trialDateTime: trials.trialDateTime,
          caseTitle: cases.caseTitle,
          caseNumber: cases.caseNumber,
          clientName: clients.name,
          courtName: courts.name,
          createdAt: trials.createdAt,
          updatedAt: trials.updatedAt,
        })
        .from(trials)
        .innerJoin(cases, eq(trials.caseId, cases.id))
        .innerJoin(clients, eq(cases.clientId, clients.id))
        .innerJoin(courts, eq(trials.courtId, courts.id))
        .where(and(eq(trials.organizationId, orgId), isNull(trials.deletedAt)))
        .orderBy(trials.trialDateTime)

      return result as TrialListItem[]
    } catch (error) {
      console.error('[TRIAL SERVICE] List trials error:', error)
      throw new Error('Failed to fetch trials')
    }
  }
}

export function createTrialService(db: NodePgDatabase) {
  return new TrialService(db)
}

import { and, eq, isNull } from 'drizzle-orm'
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

    const [newTrial] = await this.db
      .insert(trials)
      .values({
        ...data,
        organizationId: orgId,
        createdBy: userId,
      })
      .returning()

    if (!newTrial) {
      throw new Error('Failed to create trial')
    }

    return newTrial as TrialResponse
  }

  async getTrialById(trialId: string, orgId: string): Promise<TrialWithRelations> {
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
  }

  async updateTrial(trialId: string, orgId: string, userId: string, data: UpdateTrialInput): Promise<TrialResponse> {
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
  }

  async deleteTrial(trialId: string, orgId: string, userId: string): Promise<{ success: boolean }> {
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
  }

  async listTrials(orgId: string): Promise<TrialListItem[]> {
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
  }
}

export function createTrialService(db: NodePgDatabase) {
  return new TrialService(db)
}

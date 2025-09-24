import { and, eq, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { cases } from '../db/schema/cases'
import { clients } from '../db/schema/clients'
import { courts } from '../db/schema/courts'
import { opponents } from '../db/schema/opponents'
import { member, user } from '../db/schema/auth'
import type { CreateCaseInput, UpdateCaseInput, CaseResponse, CaseListItem, CaseWithRelations } from '../types/case'

export class CaseService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createCase(orgId: string, userId: string, data: CreateCaseInput): Promise<CaseResponse> {
    // Verify user belongs to organization
    const userMembership = await this.db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))

    if (userMembership.length === 0) {
      throw new Error('User not found in organization')
    }

    // Verify client exists and belongs to organization
    const clientExists = await this.db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, data.clientId),
          eq(clients.organizationId, orgId),
          isNull(clients.deletedAt)
        )
      )

    if (clientExists.length === 0) {
      throw new Error('Client not found')
    }

    // Verify court exists if provided
    if (data.courtId) {
      const courtExists = await this.db
        .select()
        .from(courts)
        .where(eq(courts.id, data.courtId))

      if (courtExists.length === 0) {
        throw new Error('Court not found')
      }
    }

    // Verify opponent exists if provided
    if (data.opponentId) {
      const opponentExists = await this.db
        .select()
        .from(opponents)
        .where(
          and(
            eq(opponents.id, data.opponentId),
            eq(opponents.organizationId, orgId),
            isNull(opponents.deletedAt)
          )
        )

      if (opponentExists.length === 0) {
        throw new Error('Opponent not found')
      }
    }

    const [newCase] = await this.db
      .insert(cases)
      .values({
        ...data,
        organizationId: orgId,
        createdBy: userId,
      })
      .returning()

    if (!newCase) {
      throw new Error('Failed to create case')
    }

    return newCase as CaseResponse
  }

  async getCaseById(caseId: string, orgId: string): Promise<CaseWithRelations> {
    const result = await this.db
      .select({
        case: cases,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
        },
        opponent: {
          id: opponents.id,
          name: opponents.name,
          opponentType: opponents.opponentType,
        },
        court: {
          id: courts.id,
          name: courts.name,
          state: courts.state,
          courtType: courts.courtType,
        },
        createdByUser: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(cases)
      .innerJoin(clients, eq(cases.clientId, clients.id))
      .leftJoin(opponents, eq(cases.opponentId, opponents.id))
      .leftJoin(courts, eq(cases.courtId, courts.id))
      .leftJoin(user, eq(cases.createdBy, user.id))
      .where(
        and(
          eq(cases.id, caseId),
          eq(cases.organizationId, orgId),
          isNull(cases.deletedAt)
        )
      )

    if (result.length === 0) {
      throw new Error('Case not found')
    }

    const caseData = result[0]
    if (!caseData) {
      throw new Error('Case data not found')
    }

    return {
      ...caseData.case,
      client: caseData.client,
      opponent: caseData.opponent,
      court: caseData.court,
      createdByUser: caseData.createdByUser,
    } as CaseWithRelations
  }

  async updateCase(caseId: string, orgId: string, userId: string, data: UpdateCaseInput): Promise<CaseResponse> {
    // Verify case exists and belongs to organization
    const existingCase = await this.db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.id, caseId),
          eq(cases.organizationId, orgId),
          isNull(cases.deletedAt)
        )
      )

    if (existingCase.length === 0) {
      throw new Error('Case not found')
    }

    // Verify client exists if being updated
    if (data.clientId) {
      const clientExists = await this.db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.id, data.clientId),
            eq(clients.organizationId, orgId),
            isNull(clients.deletedAt)
          )
        )

      if (clientExists.length === 0) {
        throw new Error('Client not found')
      }
    }

    // Verify court exists if being updated
    if (data.courtId) {
      const courtExists = await this.db
        .select()
        .from(courts)
        .where(eq(courts.id, data.courtId))

      if (courtExists.length === 0) {
        throw new Error('Court not found')
      }
    }

    // Verify opponent exists if being updated
    if (data.opponentId) {
      const opponentExists = await this.db
        .select()
        .from(opponents)
        .where(
          and(
            eq(opponents.id, data.opponentId),
            eq(opponents.organizationId, orgId),
            isNull(opponents.deletedAt)
          )
        )

      if (opponentExists.length === 0) {
        throw new Error('Opponent not found')
      }
    }

    const [updatedCase] = await this.db
      .update(cases)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId))
      .returning()

    if (!updatedCase) {
      throw new Error('Failed to update case')
    }

    return updatedCase as CaseResponse
  }

  async deleteCase(caseId: string, orgId: string, userId: string): Promise<{ success: boolean }> {
    // Verify case exists and belongs to organization
    const existingCase = await this.db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.id, caseId),
          eq(cases.organizationId, orgId),
          isNull(cases.deletedAt)
        )
      )

    if (existingCase.length === 0) {
      throw new Error('Case not found')
    }

    // Soft delete
    await this.db
      .update(cases)
      .set({
        deletedBy: userId,
        deletedAt: new Date(),
      })
      .where(eq(cases.id, caseId))

    return { success: true }
  }

  async listCases(orgId: string): Promise<CaseListItem[]> {
    const result = await this.db
      .select({
        id: cases.id,
        caseNumber: cases.caseNumber,
        caseTitle: cases.caseTitle,
        caseStatus: cases.caseStatus,
        priority: cases.priority,
        clientName: clients.name,
        opponentName: opponents.name,
        courtName: courts.name,
        createdAt: cases.createdAt,
        updatedAt: cases.updatedAt,
      })
      .from(cases)
      .innerJoin(clients, eq(cases.clientId, clients.id))
      .leftJoin(opponents, eq(cases.opponentId, opponents.id))
      .leftJoin(courts, eq(cases.courtId, courts.id))
      .where(
        and(
          eq(cases.organizationId, orgId),
          isNull(cases.deletedAt)
        )
      )
      .orderBy(cases.createdAt)

    return result as CaseListItem[]
  }
}

export function createCaseService(db: NodePgDatabase) {
  return new CaseService(db)
}
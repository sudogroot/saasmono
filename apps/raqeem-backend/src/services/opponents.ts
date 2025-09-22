import { and, eq, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member } from '../db/schema/auth'
import { opponents } from '../db/schema/opponents'
import type { CreateOpponentInput, OpponentListItem, OpponentResponse, UpdateOpponentInput } from '../types/opponent'

export class OpponentService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createOpponent(orgId: string, userId: string, data: CreateOpponentInput): Promise<OpponentResponse> {
    // Verify user belongs to organization
    const usermemberhip = await this.db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))

    if (usermemberhip.length === 0) {
      throw new Error('User not found in organization')
    }

    const [newOpponent] = await this.db
      .insert(opponents)
      .values({
        ...data,
        organizationId: orgId,
        createdBy: userId,
      })
      .returning()

    if (!newOpponent) {
      throw new Error('Failed to create opponent')
    }

    return newOpponent as OpponentResponse
  }

  async getOpponentById(opponentId: string, orgId: string): Promise<OpponentResponse> {
    const result = await this.db
      .select()
      .from(opponents)
      .where(and(eq(opponents.id, opponentId), eq(opponents.organizationId, orgId), isNull(opponents.deletedAt)))

    if (result.length === 0) {
      throw new Error('Opponent not found')
    }

    const opponentData = result[0]
    if (!opponentData) {
      throw new Error('Opponent data not found')
    }

    return opponentData as OpponentResponse
  }

  async updateOpponent(
    opponentId: string,
    orgId: string,
    userId: string,
    data: UpdateOpponentInput
  ): Promise<OpponentResponse> {
    // Verify opponent exists and belongs to organization
    const existingOpponent = await this.db
      .select()
      .from(opponents)
      .where(and(eq(opponents.id, opponentId), eq(opponents.organizationId, orgId), isNull(opponents.deletedAt)))

    if (existingOpponent.length === 0) {
      throw new Error('Opponent not found')
    }

    const [updatedOpponent] = await this.db
      .update(opponents)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(opponents.id, opponentId))
      .returning()

    if (!updatedOpponent) {
      throw new Error('Failed to update opponent')
    }

    return updatedOpponent as OpponentResponse
  }

  async deleteOpponent(opponentId: string, orgId: string, userId: string): Promise<{ success: boolean }> {
    // Verify opponent exists and belongs to organization
    const existingOpponent = await this.db
      .select()
      .from(opponents)
      .where(and(eq(opponents.id, opponentId), eq(opponents.organizationId, orgId), isNull(opponents.deletedAt)))

    if (existingOpponent.length === 0) {
      throw new Error('Opponent not found')
    }

    // Soft delete
    await this.db
      .update(opponents)
      .set({
        deletedBy: userId,
        deletedAt: new Date(),
      })
      .where(eq(opponents.id, opponentId))

    return { success: true }
  }

  async listOpponents(orgId: string): Promise<OpponentListItem[]> {
    const opponent = await this.db
      .select({
        id: opponents.id,
        name: opponents.name,
        opponentType: opponents.opponentType,
        createdAt: opponents.createdAt,
        updatedAt: opponents.updatedAt,
      })
      .from(opponents)
      .where(and(eq(opponents.organizationId, orgId), isNull(opponents.deletedAt)))
      .orderBy(opponents.createdAt)

    return opponent as OpponentListItem[]
  }
}

export function createOpponentService(db: NodePgDatabase) {
  return new OpponentService(db)
}

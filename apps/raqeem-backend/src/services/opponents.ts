import { and, eq, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member } from '../db/schema/auth'
import { opponents } from '../db/schema/opponents'
import type { CreateOpponentInput, OpponentDropdownItem, OpponentListItem, OpponentResponse, UpdateOpponentInput } from '../types/opponent'

export class OpponentService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createOpponent(orgId: string, userId: string, data: CreateOpponentInput): Promise<OpponentResponse> {
    try {
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
    } catch (error) {
      console.error('[OPPONENT SERVICE] Create opponent error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to create opponent')
    }
  }

  async getOpponentById(opponentId: string, orgId: string): Promise<OpponentResponse> {
    try {
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
    } catch (error) {
      console.error('[OPPONENT SERVICE] Get opponent by ID error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to fetch opponent')
    }
  }

  async updateOpponent(
    opponentId: string,
    orgId: string,
    userId: string,
    data: UpdateOpponentInput
  ): Promise<OpponentResponse> {
    try {
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
    } catch (error) {
      console.error('[OPPONENT SERVICE] Update opponent error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to update opponent')
    }
  }

  async deleteOpponent(opponentId: string, orgId: string, userId: string): Promise<{ success: boolean }> {
    try {
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
    } catch (error) {
      console.error('[OPPONENT SERVICE] Delete opponent error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to delete opponent')
    }
  }

  async listOpponents(orgId: string): Promise<OpponentListItem[]> {
    try {
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
    } catch (error) {
      console.error('[OPPONENT SERVICE] List opponents error:', error)
      throw new Error('Failed to fetch opponents')
    }
  }

  async getOpponentsForDropdown(orgId: string): Promise<OpponentDropdownItem[]> {
    try {
      const result = await this.db
        .select({
          id: opponents.id,
          name: opponents.name,
          opponentType: opponents.opponentType,
        })
        .from(opponents)
        .where(and(eq(opponents.organizationId, orgId), isNull(opponents.deletedAt)))
        .orderBy(opponents.name)

      return result as OpponentDropdownItem[]
    } catch (error) {
      console.error('[OPPONENT SERVICE] Get opponents for dropdown error:', error)
      throw new Error('Failed to fetch opponents for dropdown')
    }
  }
}

export function createOpponentService(db: NodePgDatabase) {
  return new OpponentService(db)
}

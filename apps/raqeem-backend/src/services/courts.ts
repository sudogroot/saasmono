import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member } from '../db/schema/auth'
import { courts } from '../db/schema/courts'
import type { CourtsByState, CourtListItem, CourtResponse, CreateCourtInput, UpdateCourtInput } from '../types/court'

export class CourtService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createCourt(orgId: string, userId: string, data: CreateCourtInput): Promise<CourtResponse> {
    try {
      // Verify user belongs to organization
      const usermemberhip = await this.db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))

      if (usermemberhip.length === 0) {
        throw new Error('User not found in organization')
      }

      const [newCourt] = await this.db
        .insert(courts)
        .values({
          ...data,
        })
        .returning()

      if (!newCourt) {
        throw new Error('Failed to create court')
      }

      return newCourt as CourtResponse
    } catch (error) {
      console.error('[COURT SERVICE] Create court error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to create court')
    }
  }

  async getCourtById(courtId: string, orgId: string): Promise<CourtResponse> {
    try {
      const result = await this.db
        .select()
        .from(courts)
        .where(and(eq(courts.id, courtId)))

      if (result.length === 0) {
        throw new Error('Court not found')
      }

      return result[0] as CourtResponse
    } catch (error) {
      console.error('[COURT SERVICE] Get court by ID error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to fetch court')
    }
  }

  async updateCourt(courtId: string, orgId: string, data: UpdateCourtInput): Promise<CourtResponse> {
    try {
      // Verify court exists and belongs to organization
      const existingCourt = await this.db
        .select()
        .from(courts)
        .where(and(eq(courts.id, courtId)))

      if (existingCourt.length === 0) {
        throw new Error('Court not found')
      }

      const [updatedCourt] = await this.db
        .update(courts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(courts.id, courtId))
        .returning()

      if (!updatedCourt) {
        throw new Error('Failed to update court')
      }

      return updatedCourt as CourtResponse
    } catch (error) {
      console.error('[COURT SERVICE] Update court error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to update court')
    }
  }

  async deleteCourt(courtId: string, orgId: string): Promise<{ success: boolean }> {
    try {
      // Verify court exists and belongs to organization
      const existingCourt = await this.db
        .select()
        .from(courts)
        .where(and(eq(courts.id, courtId)))

      if (existingCourt.length === 0) {
        throw new Error('Court not found')
      }

      await this.db.delete(courts).where(eq(courts.id, courtId))

      return { success: true }
    } catch (error) {
      console.error('[COURT SERVICE] Delete court error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to delete court')
    }
  }

  async listCourts(orgId: string): Promise<CourtListItem[]> {
    try {
      const result = await this.db
        .select({
          id: courts.id,
          name: courts.name,
          state: courts.state,
          courtType: courts.courtType,
          createdAt: courts.createdAt,
          updatedAt: courts.updatedAt,
        })
        .from(courts)
        .orderBy(courts.createdAt)

      return result as CourtListItem[]
    } catch (error) {
      console.error('[COURT SERVICE] List courts error:', error)
      throw new Error('Failed to fetch courts')
    }
  }

  async getCourtsForDropdown(): Promise<CourtsByState[]> {
    try {
      const result = await this.db
        .select({
          id: courts.id,
          name: courts.name,
          state: courts.state,
        })
        .from(courts)
        .orderBy(courts.state, courts.name)

      // Group courts by state
      const courtsByState = new Map<string, { id: string; name: string }[]>()

      for (const court of result) {
        if (!courtsByState.has(court.state)) {
          courtsByState.set(court.state, [])
        }
        courtsByState.get(court.state)!.push({
          id: court.id,
          name: court.name,
        })
      }

      // Convert to array format
      return Array.from(courtsByState.entries()).map(([state, courts]) => ({
        state,
        courts,
      }))
    } catch (error) {
      console.error('[COURT SERVICE] Get courts for dropdown error:', error)
      throw new Error('Failed to fetch courts for dropdown')
    }
  }
}

export function createCourtService(db: NodePgDatabase) {
  return new CourtService(db)
}

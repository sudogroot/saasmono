import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member } from '../db/schema/auth'
import { courts } from '../db/schema/courts'
import type { CourtListItem, CourtResponse, CreateCourtInput, UpdateCourtInput } from '../types/court'

export class CourtService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createCourt(orgId: string, userId: string, data: CreateCourtInput): Promise<CourtResponse> {
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
  }

  async getCourtById(courtId: string, orgId: string): Promise<CourtResponse> {
    const result = await this.db
      .select()
      .from(courts)
      .where(and(eq(courts.id, courtId)))

    if (result.length === 0) {
      throw new Error('Court not found')
    }

    return result[0] as CourtResponse
  }

  async updateCourt(courtId: string, orgId: string, data: UpdateCourtInput): Promise<CourtResponse> {
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
  }

  async deleteCourt(courtId: string, orgId: string): Promise<{ success: boolean }> {
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
  }

  async listCourts(orgId: string): Promise<CourtListItem[]> {
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
  }
}

export function createCourtService(db: NodePgDatabase) {
  return new CourtService(db)
}

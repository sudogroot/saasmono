import { room } from '@/db/schema/room'
import type { CreateRoomInput, RoomListItem, UpdateRoomInput } from '@/types/room'
import { and, eq, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class RoomManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getRoomsList(orgId: string) {
    const results = await this.db
      .select({
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        roomDescription: room.description,
        roomCapacity: room.capacity,
        roomLocation: room.location,
      })
      .from(room)
      .where(and(eq(room.orgId, orgId), isNull(room.deletedAt)))

    return results.map((row) => ({
      id: row.roomId,
      name: row.roomName,
      code: row.roomCode,
      description: row.roomDescription,
      capacity: row.roomCapacity,
      location: row.roomLocation,
    })) as RoomListItem[]
  }

  async getRoomById(roomId: string, orgId: string) {
    const result = await this.db
      .select({
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        roomDescription: room.description,
        roomCapacity: room.capacity,
        roomLocation: room.location,
        roomOrgId: room.orgId,
        roomCreatedAt: room.createdAt,
        roomUpdatedAt: room.updatedAt,
        roomDeletedAt: room.deletedAt,
      })
      .from(room)
      .where(and(eq(room.id, roomId), eq(room.orgId, orgId), isNull(room.deletedAt)))

    if (!result[0] || result.length === 0) {
      throw new Error('Room not found')
    }

    const row = result[0]

    return {
      id: row.roomId,
      name: row.roomName,
      code: row.roomCode,
      description: row.roomDescription,
      capacity: row.roomCapacity,
      location: row.roomLocation,
      orgId: row.roomOrgId,
      createdAt: row.roomCreatedAt,
      updatedAt: row.roomUpdatedAt,
      deletedAt: row.roomDeletedAt,
    }
  }

  async createRoom(input: CreateRoomInput, orgId: string, userId: string) {
    const result = await this.db
      .insert(room)
      .values({
        name: input.name,
        code: input.code,
        description: input.description || null,
        capacity: input.capacity || null,
        location: input.location || null,
        orgId,
        createdByUserId: userId,
      })
      .returning({
        id: room.id,
        name: room.name,
        code: room.code,
        description: room.description,
        capacity: room.capacity,
        location: room.location,
        orgId: room.orgId,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        deletedAt: room.deletedAt,
      })

    if (!result[0]) {
      throw new Error('Failed to create room')
    }

    return result[0]
  }

  async updateRoom(roomId: string, input: UpdateRoomInput, orgId: string, userId: string) {
    const result = await this.db
      .update(room)
      .set({
        ...input,
        updatedByUserId: userId,
      })
      .where(and(eq(room.id, roomId), eq(room.orgId, orgId), isNull(room.deletedAt)))
      .returning({
        id: room.id,
        name: room.name,
        code: room.code,
        description: room.description,
        capacity: room.capacity,
        location: room.location,
        orgId: room.orgId,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        deletedAt: room.deletedAt,
      })

    if (!result[0] || result.length === 0) {
      throw new Error('Room not found or failed to update')
    }

    return result[0]
  }

  async deleteRoom(roomId: string, orgId: string, userId: string) {
    const result = await this.db
      .update(room)
      .set({
        deletedAt: new Date(),
        deletedByUserId: userId,
      })
      .where(and(eq(room.id, roomId), eq(room.orgId, orgId), isNull(room.deletedAt)))
      .returning({ id: room.id })

    if (!result[0] || result.length === 0) {
      throw new Error('Room not found or failed to delete')
    }

    return { success: true }
  }
}

// Factory function to create service instance
export function createRoomManagementService(db: NodePgDatabase) {
  return new RoomManagementService(db)
}
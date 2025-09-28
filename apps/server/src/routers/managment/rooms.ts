import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createRoomManagementService } from '../../services/managment/rooms'
import { CreateRoomInputSchema, RoomListItemSchema, RoomSchema, UpdateRoomInputSchema } from '../../types/room'

const roomService = createRoomManagementService(db)

export const roomManagementRouter = {
  // Rooms
  getRoomsList: protectedProcedure
    .output(z.array(RoomListItemSchema))
    .route({
      method: 'GET',
      path: '/management/rooms',
      tags: ['Room Management'],
      summary: 'List rooms',
      description: 'Retrieves all rooms for the organization',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await roomService.getRoomsList(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch rooms')
      }
    }),

  getRoomById: protectedProcedure
    .input(
      z.object({
        roomId: z.uuid().describe('Room ID'),
      })
    )
    .output(RoomSchema)
    .route({
      method: 'GET',
      path: '/management/rooms/{roomId}',
      tags: ['Room Management'],
      summary: 'Get room',
      description: 'Retrieves a single room by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await roomService.getRoomById(input.roomId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch room')
      }
    }),

  createRoom: protectedProcedure
    .input(CreateRoomInputSchema)
    .output(RoomSchema)
    .route({
      method: 'POST',
      path: '/management/rooms',
      tags: ['Room Management'],
      summary: 'Create room',
      description: 'Creates a new room in the organization',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await roomService.createRoom(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create room')
      }
    }),

  updateRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.uuid().describe('Room ID'),
        data: UpdateRoomInputSchema,
      })
    )
    .output(RoomSchema)
    .route({
      method: 'PUT',
      path: '/management/rooms/{roomId}',
      tags: ['Room Management'],
      summary: 'Update room',
      description: 'Updates an existing room',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await roomService.updateRoom(input.roomId, input.data, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update room')
      }
    }),

  deleteRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.uuid().describe('Room ID'),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .route({
      method: 'DELETE',
      path: '/management/rooms/{roomId}',
      tags: ['Room Management'],
      summary: 'Delete room',
      description: 'Deletes a room (soft delete)',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await roomService.deleteRoom(input.roomId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete room')
      }
    }),
}
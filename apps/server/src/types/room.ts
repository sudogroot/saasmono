import { z } from 'zod'

// Base Room Schema
export const RoomSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  capacity: z.string().nullable(),
  location: z.string().nullable(),
  orgId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

// Room List Item Schema (simplified for list views)
export const RoomListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  capacity: z.string().nullable(),
  location: z.string().nullable(),
})

// Input Schemas for Creating/Updating
export const CreateRoomInputSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  code: z.string().min(1, 'Room code is required'),
  description: z.string().optional(),
  capacity: z.string().optional(),
  location: z.string().optional(),
})

export const UpdateRoomInputSchema = CreateRoomInputSchema.partial()

// Type exports
export type Room = z.infer<typeof RoomSchema>
export type RoomListItem = z.infer<typeof RoomListItemSchema>
export type CreateRoomInput = z.infer<typeof CreateRoomInputSchema>
export type UpdateRoomInput = z.infer<typeof UpdateRoomInputSchema>
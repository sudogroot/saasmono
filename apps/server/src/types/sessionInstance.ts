import { z } from 'zod'

// Session Instance Schema
export const SessionInstanceSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']),
  classroomId: z.uuid().nullable(),
  classroomGroupId: z.uuid().nullable(),
  teacherId: z.string(),
  educationSubjectId: z.uuid(),
  roomId: z.uuid(),
  orgId: z.string(),
  actualStartDateTime: z.date().nullable(),
  actualEndDateTime: z.date().nullable(),
  notes: z.string().nullable(),
  additionalData: z.any().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  // Joined data
  teacher: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  educationSubject: z.object({
    id: z.uuid(),
    name: z.string(),
    displayNameEn: z.string(),
    displayNameFr: z.string(),
    displayNameAr: z.string(),
  }),
  room: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
  }),
  classroom: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
  }).nullable(),
  classroomGroup: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
  }).nullable(),
})

// Session Instance List Item Schema (simplified for list views)
export const SessionInstanceListItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']),
  teacher: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
  educationSubject: z.object({
    id: z.uuid(),
    name: z.string(),
    displayNameEn: z.string(),
  }),
  room: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
  }),
  classroom: z.object({
    id: z.uuid(),
    name: z.string(),
  }).nullable(),
  classroomGroup: z.object({
    id: z.uuid(),
    name: z.string(),
  }).nullable(),
})

// Input Schemas for Creating/Updating
export const CreateSessionInstanceInputSchema = z.object({
  title: z.string().min(1, 'Session title is required'),
  startDateTime: z.date(),
  endDateTime: z.date(),
  classroomId: z.uuid().optional(),
  classroomGroupId: z.uuid().optional(),
  teacherId: z.string().min(1, 'Teacher is required'),
  educationSubjectId: z.uuid(),
  roomId: z.uuid(),
  notes: z.string().optional(),
  additionalData: z.any().optional(),
}).refine(
  (data) => data.classroomId || data.classroomGroupId,
  {
    message: "Either classroomId or classroomGroupId must be provided",
    path: ["classroomId"],
  }
).refine(
  (data) => !(data.classroomId && data.classroomGroupId),
  {
    message: "Cannot provide both classroomId and classroomGroupId",
    path: ["classroomId"],
  }
).refine(
  (data) => data.endDateTime > data.startDateTime,
  {
    message: "End time must be after start time",
    path: ["endDateTime"],
  }
)

export const UpdateSessionInstanceInputSchema = CreateSessionInstanceInputSchema.partial()

// Query Schemas
export const SessionInstanceQuerySchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  teacherId: z.string().optional(),
  classroomId: z.uuid().optional(),
  classroomGroupId: z.uuid().optional(),
  educationSubjectId: z.uuid().optional(),
  roomId: z.uuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
})

// Type exports
export type SessionInstance = z.infer<typeof SessionInstanceSchema>
export type SessionInstanceListItem = z.infer<typeof SessionInstanceListItemSchema>
export type CreateSessionInstanceInput = z.infer<typeof CreateSessionInstanceInputSchema>
export type UpdateSessionInstanceInput = z.infer<typeof UpdateSessionInstanceInputSchema>
export type SessionInstanceQuery = z.infer<typeof SessionInstanceQuerySchema>
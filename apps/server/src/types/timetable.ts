import { z } from 'zod'

// Session Instance Schema
export const TimetableSchema = z.object({
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
export const TimetableListItemSchema = z.object({
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
export const CreateTimetableInputSchema = z.object({
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

export const UpdateTimetableInputSchema = CreateTimetableInputSchema.partial()

// Query Schemas
export const TimetableQuerySchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  teacherId: z.string().optional(),
  classroomId: z.uuid().optional(),
  classroomGroupId: z.uuid().optional(),
  educationSubjectId: z.uuid().optional(),
  roomId: z.uuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
})

// Timetable Image Schemas
export const TimetableImageSchema = z.object({
  id: z.uuid(),
  dataHash: z.string(),
  imagePath: z.string(),
  orgId: z.string(),
  createdByUserId: z.string().nullable(),
  createdAt: z.date(),
  lastAccessedAt: z.date(),
})

export const CreateTimetableImageInputSchema = z.object({
  dataHash: z.string().min(1, 'Data hash is required'),
  imagePath: z.string().min(1, 'Image path is required'),
})

export const TimetableImageGenerationRequestSchema = z.object({
  classroomId: z.uuid().optional(),
  classroomGroupId: z.uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(
  (data) => data.classroomId || data.classroomGroupId,
  {
    message: "Either classroomId or classroomGroupId must be provided",
    path: ["classroomId"],
  }
)

export const TimetableImageResponseSchema = z.object({
  success: z.boolean(),
  imagePath: z.string().optional(),
  message: z.string().optional(),
})

// Type exports
export type Timetable = z.infer<typeof TimetableSchema>
export type TimetableListItem = z.infer<typeof TimetableListItemSchema>
export type CreateTimetableInput = z.infer<typeof CreateTimetableInputSchema>
export type UpdateTimetableInput = z.infer<typeof UpdateTimetableInputSchema>
export type TimetableQuery = z.infer<typeof TimetableQuerySchema>
export type TimetableImage = z.infer<typeof TimetableImageSchema>
export type CreateTimetableImageInput = z.infer<typeof CreateTimetableImageInputSchema>
export type TimetableImageGenerationRequest = z.infer<typeof TimetableImageGenerationRequestSchema>
export type TimetableImageResponse = z.infer<typeof TimetableImageResponseSchema>
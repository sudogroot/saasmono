import { z } from 'zod'

// Court Type Enum
export const CourtTypeSchema = z.enum(['civil', 'criminal', 'administrative', 'commercial', 'family', 'labor'])

// Input Schemas
export const CreateCourtSchema = z.object({
  name: z.string().min(1),
  state: z.string().min(1),
  courtType: z.string().min(1),
})

export const UpdateCourtSchema = z.object({
  name: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  courtType: z.string().min(1).optional(),
})

// Output Schemas
export const CourtSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  organizationId: z.string(),
  courtType: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CourtListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  courtType: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

// Type exports
export type CreateCourtInput = z.infer<typeof CreateCourtSchema>
export type UpdateCourtInput = z.infer<typeof UpdateCourtSchema>
export type CourtResponse = z.infer<typeof CourtSchema>
export type CourtListItem = z.infer<typeof CourtListItemSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
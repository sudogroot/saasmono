import { z } from 'zod'

// Input Schemas
export const CreateTrialSchema = z.object({
  caseId: z.string().min(1),
  courtId: z.string().min(1),
  trialDateTime: z.coerce.date(),
})

export const UpdateTrialSchema = z.object({
  courtId: z.string().min(1).optional(),
  trialDateTime: z.coerce.date().optional(),
})

// Output Schemas with Related Data
export const TrialWithRelationsSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  caseId: z.string(),
  trialNumber: z.number(),
  courtId: z.string(),
  trialDateTime: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
  case: z.object({
    id: z.string(),
    caseNumber: z.string(),
    caseTitle: z.string(),
  }),
  client: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  court: z.object({
    id: z.string(),
    name: z.string(),
    state: z.string(),
    courtType: z.string(),
  }),
  assignedLawyer: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }).nullable(),
})

export const TrialSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  caseId: z.string(),
  trialNumber: z.number(),
  courtId: z.string(),
  trialDateTime: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
})

export const TrialListItemSchema = z.object({
  id: z.string(),
  trialNumber: z.number(),
  trialDateTime: z.coerce.date(),
  caseTitle: z.string(),
  caseNumber: z.string(),
  clientName: z.string(),
  courtName: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

// Type exports
export type CreateTrialInput = z.infer<typeof CreateTrialSchema>
export type UpdateTrialInput = z.infer<typeof UpdateTrialSchema>
export type TrialResponse = z.infer<typeof TrialSchema>
export type TrialWithRelations = z.infer<typeof TrialWithRelationsSchema>
export type TrialListItem = z.infer<typeof TrialListItemSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
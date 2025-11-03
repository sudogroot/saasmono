import { z } from 'zod'

// Opponent Type Enum (same as clientTypeEnum)
export const OpponentTypeSchema = z.enum(['individual', 'company', 'institution', 'organization', 'government', 'association'])

// Input Schemas
export const CreateOpponentSchema = z.object({
  name: z.string().min(1),
  opponentType: OpponentTypeSchema.default('individual'),
})

export const UpdateOpponentSchema = z.object({
  name: z.string().min(1).optional(),
  opponentType: OpponentTypeSchema.optional(),
})

// Output Schemas
export const OpponentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  opponentType: OpponentTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
})

export const OpponentListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  opponentType: OpponentTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const OpponentDropdownItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  opponentType: OpponentTypeSchema,
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

export const OpponentDeletionImpactSchema = z.object({
  casesCount: z.number(),
  cases: z.array(z.object({
    id: z.string(),
    caseNumber: z.string(),
    caseTitle: z.string(),
  })),
})

// Type exports
export type OpponentType = z.infer<typeof OpponentTypeSchema>
export type CreateOpponentInput = z.infer<typeof CreateOpponentSchema>
export type UpdateOpponentInput = z.infer<typeof UpdateOpponentSchema>
export type OpponentResponse = z.infer<typeof OpponentSchema>
export type OpponentListItem = z.infer<typeof OpponentListItemSchema>
export type OpponentDropdownItem = z.infer<typeof OpponentDropdownItemSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
export type OpponentDeletionImpact = z.infer<typeof OpponentDeletionImpactSchema>
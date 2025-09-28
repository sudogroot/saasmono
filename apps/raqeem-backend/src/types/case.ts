import { z } from 'zod'

// Case Status and Priority Enums
export const CaseStatusSchema = z.enum([
  'new',
  'under-review',
  'filed-to-court',
  'under-consideration',
  'won',
  'lost',
  'postponed',
  'closed',
  'withdrawn',
  'suspended',
])

export const PrioritySchema = z.enum(['low', 'normal', 'medium', 'high', 'urgent', 'critical'])

// Input Schemas
export const CreateCaseSchema = z.object({
  caseNumber: z.string().min(1),
  caseTitle: z.string().min(1),
  courtId: z.string().optional(),
  courtFileNumber: z.string().optional(),
  clientId: z.string().min(1),
  opponentId: z.string().optional(),
  caseSubject: z.string().min(1),
  caseStatus: CaseStatusSchema.default('new'),
  priority: PrioritySchema.default('medium'),
})

export const UpdateCaseSchema = z.object({
  caseNumber: z.string().min(1).optional(),
  caseTitle: z.string().min(1).optional(),
  courtId: z.string().optional(),
  courtFileNumber: z.string().optional(),
  clientId: z.string().min(1).optional(),
  opponentId: z.string().optional(),
  caseSubject: z.string().min(1).optional(),
  caseStatus: CaseStatusSchema.optional(),
  priority: PrioritySchema.optional(),
})

// Output Schemas
export const CaseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  caseNumber: z.string(),
  caseTitle: z.string(),
  courtId: z.string().nullable(),
  courtFileNumber: z.string().nullable(),
  clientId: z.string(),
  opponentId: z.string().nullable(),
  caseSubject: z.string(),
  caseStatus: CaseStatusSchema,
  priority: PrioritySchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
})

export const CaseWithRelationsSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  caseNumber: z.string(),
  caseTitle: z.string(),
  courtId: z.string().nullable(),
  courtFileNumber: z.string().nullable(),
  clientId: z.string(),
  opponentId: z.string().nullable(),
  caseSubject: z.string(),
  caseStatus: CaseStatusSchema,
  priority: PrioritySchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
  client: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  opponent: z
    .object({
      id: z.string(),
      name: z.string(),
      opponentType: z.string(),
    })
    .nullable(),
  court: z
    .object({
      id: z.string(),
      name: z.string(),
      state: z.string(),
      courtType: z.string(),
    })
    .nullable(),
  createdByUser: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .nullable(),
})

export const CaseListItemSchema = z.object({
  id: z.string(),
  caseNumber: z.string(),
  caseTitle: z.string(),
  caseStatus: CaseStatusSchema,
  priority: PrioritySchema,
  clientName: z.string(),
  opponentName: z.string().nullable(),
  courtName: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

// Type exports
export type CaseStatus = z.infer<typeof CaseStatusSchema>
export type Priority = z.infer<typeof PrioritySchema>
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>
export type CaseResponse = z.infer<typeof CaseSchema>
export type CaseWithRelations = z.infer<typeof CaseWithRelationsSchema>
export type CaseListItem = z.infer<typeof CaseListItemSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>

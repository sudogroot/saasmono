import { z } from 'zod'

// Client Type Enum (matching the database enum)
export const ClientTypeSchema = z.enum([
  'individual',
  'company',
  'institution',
  'organization',
  'government',
  'association',
])

// Input Schemas
export const CreateClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  clientType: ClientTypeSchema.default('individual'),
})

export const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  clientType: ClientTypeSchema.optional(),
})

export const ClientTrialSchema = z.object({
  id: z.string(),
  trialNumber: z.number(),
  court: z
    .object({
      name: z.string().min(1),
      id: z.string().nullable(),
    })
    .nullable(),
  trialDateTime: z.coerce.date(),
})

// Output Schemas
export const ClientCaseSchema = z.object({
  id: z.string(),
  caseNumber: z.string(),
  caseTitle: z.string(),
  courtFileNumber: z.string().nullable(),
  caseSubject: z.string(),
  caseStatus: z.string(), // TODO :we have a bette schema for this
  priority: z.string(), // TODO :same
  trial: z.array(ClientTrialSchema).nullable(),
})

// Output Schemas
export const ClientSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  nationalId: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  clientType: ClientTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
})

export const ClientListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  clientType: ClientTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  case: z.array(ClientCaseSchema),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

// Type exports
export type ClientType = z.infer<typeof ClientTypeSchema>
export type CreateClientInput = z.infer<typeof CreateClientSchema>
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>
export type ClientResponse = z.infer<typeof ClientSchema>
export type ClientListItem = z.infer<typeof ClientListItemSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>

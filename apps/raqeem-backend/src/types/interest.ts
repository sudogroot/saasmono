import { z } from 'zod'

// Schema for creating interest request
export const CreateInterestRequestSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phoneNumber: z.string().min(8, 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل').max(20),
  wantsDemo: z.boolean().default(false),
  notes: z.string().optional(),
})

// Response schema
export const InterestRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  wantsDemo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  notes: z.string().nullable(),
  status: z.string(),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export type CreateInterestRequest = z.infer<typeof CreateInterestRequestSchema>
export type InterestRequest = z.infer<typeof InterestRequestSchema>

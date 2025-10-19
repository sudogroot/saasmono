import { z } from 'zod'

// Late Pass Ticket Status Enum
export const TicketStatusEnum = z.enum(['ISSUED', 'USED', 'EXPIRED', 'CANCELED'])

// Late Pass Config Schema
export const LatePassConfigSchema = z.object({
  id: z.uuid(),
  maxGenerationDelayMinutes: z.number().int().min(0),
  maxAcceptanceDelayMinutes: z.number().int().min(0),
  ticketValidityDays: z.number().int().min(1).max(30),
  allowMultipleActiveTickets: z.boolean(),
  autoExpireTickets: z.boolean(),
  requireAdminApproval: z.boolean(),
  includeLogo: z.boolean(),
  includeBarcode: z.boolean(),
  logoPath: z.string().nullable(),
  orgId: z.string(),
  updatedByUserId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Late Pass Ticket Schema (full)
export const LatePassTicketSchema = z.object({
  id: z.uuid(),
  ticketNumber: z.string(), // Format: LPT-2024-000001
  studentId: z.string(),
  timetableId: z.uuid(),
  status: TicketStatusEnum,
  issuedAt: z.date(),
  usedAt: z.date().nullable(),
  expiresAt: z.date(),
  qrCodeData: z.string(),
  qrCodeImagePath: z.string().nullable(),
  pdfPath: z.string().nullable(),
  issuedByUserId: z.string(),
  canceledByUserId: z.string().nullable(),
  canceledAt: z.date().nullable(),
  cancellationReason: z.string().nullable(),
  orgId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Joined data
  student: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  timetable: z.object({
    id: z.uuid(),
    title: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    educationSubject: z.object({
      id: z.uuid(),
      displayNameAr: z.string(),
      displayNameEn: z.string().nullable(),
    }).nullable(),
    room: z.object({
      id: z.uuid(),
      name: z.string(),
    }),
    classroom: z.object({
      id: z.uuid(),
      name: z.string(),
    }).nullable(),
    classroomGroup: z.object({
      id: z.uuid(),
      name: z.string(),
    }).nullable(),
  }),
  issuedBy: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
  canceledBy: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }).nullable(),
})

// Late Pass Ticket List Item Schema (simplified for table views)
export const LatePassTicketListItemSchema = z.object({
  id: z.uuid(),
  ticketNumber: z.string(),
  studentId: z.string(),
  status: TicketStatusEnum,
  issuedAt: z.date(),
  expiresAt: z.date(),
  usedAt: z.date().nullable(),
  canceledAt: z.date().nullable(),
  cancellationReason: z.string().nullable(),
  qrCodeImagePath: z.string().nullable(),
  pdfPath: z.string().nullable(),
  student: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  timetable: z.object({
    id: z.uuid(),
    title: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    educationSubject: z.object({
      displayNameAr: z.string(),
      displayNameEn: z.string().nullable(),
    }).nullable(),
    room: z.object({
      name: z.string(),
    }),
  }),
  issuedBy: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
})

// Eligible Student Schema (students who were absent and can receive tickets)
export const EligibleStudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string(),
  email: z.string(),
  lastAttendance: z.object({
    id: z.uuid(),
    status: z.enum(['ABSENT', 'EXCUSED', 'SICK']),
    markedAt: z.date(),
    timetable: z.object({
      id: z.uuid(),
      title: z.string(),
      startDateTime: z.date(),
    }),
  }).nullable(),
  upcomingTimetablesCount: z.number(),
  activeTicketsCount: z.number(), // Number of active (ISSUED) tickets
  activeTickets: z.array(z.object({
    id: z.uuid(),
    ticketNumber: z.string(),
    pdfPath: z.string().nullable(),
    expiresAt: z.date(),
    timetable: z.object({
      title: z.string(),
    }),
  })),
})

// Upcoming Timetable Schema (for ticket generation selection)
export const UpcomingTimetableSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  educationSubject: z.object({
    id: z.uuid(),
    displayNameAr: z.string(),
    displayNameEn: z.string().nullable(),
  }).nullable(),
  room: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
  teacher: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
  hasActiveTicket: z.boolean(), // Does student already have an active ticket for this timetable?
  canGenerateTicket: z.boolean(), // Is it within the generation time window?
})

// QR Code Validation Result Schema
export const QRValidationResultSchema = z.object({
  valid: z.boolean(),
  ticket: LatePassTicketSchema.nullable(),
  error: z.string().nullable(),
  errorCode: z.enum([
    'TICKET_NOT_FOUND',
    'TICKET_ALREADY_USED',
    'TICKET_EXPIRED',
    'TICKET_CANCELED',
    'WRONG_TIMETABLE',
    'INVALID_QR',
  ]).nullable(),
})

// Input Schemas for Creating/Updating

export const GenerateTicketInputSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  timetableId: z.uuid('Invalid timetable ID'),
})

export const CancelTicketInputSchema = z.object({
  ticketId: z.uuid(),
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
})

export const UseTicketInputSchema = z.object({
  ticketId: z.uuid(),
  attendanceStatus: z.enum(['PRESENT', 'LATE']),
})

export const ValidateTicketQRInputSchema = z.object({
  qrData: z.string().min(1, 'QR data is required'),
  timetableId: z.uuid(),
})

export const UpdateLatePassConfigInputSchema = z.object({
  maxGenerationDelayMinutes: z.number().int().min(0).max(60).optional(),
  maxAcceptanceDelayMinutes: z.number().int().min(0).max(120).optional(),
  ticketValidityDays: z.number().int().min(1).max(30).optional(),
  allowMultipleActiveTickets: z.boolean().optional(),
  autoExpireTickets: z.boolean().optional(),
  requireAdminApproval: z.boolean().optional(),
  includeLogo: z.boolean().optional(),
  includeBarcode: z.boolean().optional(),
  logoPath: z.string().optional(),
})

// Query Schemas

export const GetEligibleStudentsQuerySchema = z.object({
  classroomId: z.uuid().optional(),
  classroomGroupId: z.uuid().optional(),
}).refine(
  (data) => data.classroomId || data.classroomGroupId,
  {
    message: 'Either classroomId or classroomGroupId must be provided',
  }
)

export const GetTicketsQuerySchema = z.object({
  studentId: z.string().optional(),
  timetableId: z.uuid().optional(),
  status: TicketStatusEnum.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  issuedByUserId: z.string().optional(),
})

// Type exports
export type TicketStatus = z.infer<typeof TicketStatusEnum>
export type LatePassConfig = z.infer<typeof LatePassConfigSchema>
export type LatePassTicket = z.infer<typeof LatePassTicketSchema>
export type LatePassTicketListItem = z.infer<typeof LatePassTicketListItemSchema>
export type EligibleStudent = z.infer<typeof EligibleStudentSchema>
export type UpcomingTimetable = z.infer<typeof UpcomingTimetableSchema>
export type QRValidationResult = z.infer<typeof QRValidationResultSchema>
export type GenerateTicketInput = z.infer<typeof GenerateTicketInputSchema>
export type CancelTicketInput = z.infer<typeof CancelTicketInputSchema>
export type UseTicketInput = z.infer<typeof UseTicketInputSchema>
export type ValidateTicketQRInput = z.infer<typeof ValidateTicketQRInputSchema>
export type UpdateLatePassConfigInput = z.infer<typeof UpdateLatePassConfigInputSchema>
export type GetEligibleStudentsQuery = z.infer<typeof GetEligibleStudentsQuerySchema>
export type GetTicketsQuery = z.infer<typeof GetTicketsQuerySchema>

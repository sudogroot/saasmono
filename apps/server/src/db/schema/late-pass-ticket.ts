import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { timetable } from './timetable'

// Enums for ticket status
export const ticketStatusEnum = pgEnum('ticket_status', [
  'ISSUED',    // Ticket created and ready to use
  'USED',      // Student successfully used ticket (QR scanned)
  'EXPIRED',   // Ticket validity period passed
  'CANCELED',  // Manually canceled by administrator
])

/**
 * Late Pass Tickets - Entry tickets for students who were absent
 *
 * Business Rules:
 * - Each ticket is valid for ONE specific timetable entry only
 * - Tickets expire at: timetable.startDateTime + config.maxAcceptanceDelayMinutes
 * - Students can have only ONE active (ISSUED) ticket at a time if not expired
 * - QR code must be scanned during the timetable session to mark attendance
 */
export const latePassTicket = pgTable('late_pass_ticket', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Ticket number format: LPT-YYYY-NNNNNN (e.g., LPT-2024-000001)
  // Counter resets to 000001 each year, max 999999 per year
  ticketNumber: text('ticket_number').notNull().unique(),

  // Core associations
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  timetableId: uuid('timetable_id')
    .notNull()
    .references(() => timetable.id, { onDelete: 'cascade' }),

  // Ticket lifecycle
  status: ticketStatusEnum('status').notNull().default('ISSUED'),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'), // When QR was scanned and attendance marked
  expiresAt: timestamp('expires_at').notNull(), // timetable.startDateTime + config.maxAcceptanceDelayMinutes

  // QR code data (JWT payload containing: ticketId, studentId, timetableId, expiration, signature)
  qrCodeData: text('qr_code_data').notNull(),
  qrCodeImagePath: text('qr_code_image_path'), // Path to generated QR PNG file (for PDF)

  // PDF document path
  pdfPath: text('pdf_path'), // Path to generated ticket PDF

  // Administrative actions
  issuedByUserId: text('issued_by_user_id')
    .notNull()
    .references(() => user.id),
  canceledByUserId: text('canceled_by_user_id')
    .references(() => user.id),
  canceledAt: timestamp('canceled_at'),
  cancellationReason: text('cancellation_reason'), // Why ticket was canceled

  // Organization for multi-tenancy
  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => {
  return {
    // Index for finding active tickets by student
    studentStatusExpiresIdx: index('late_pass_ticket_student_status_expires_idx').on(
      table.studentId,
      table.status,
      table.expiresAt
    ),
    // Index for timetable-based queries
    timetableStatusIdx: index('late_pass_ticket_timetable_status_idx').on(
      table.timetableId,
      table.status
    ),
    // Index for organization reports
    orgIssuedAtIdx: index('late_pass_ticket_org_issued_at_idx').on(
      table.orgId,
      table.issuedAt
    ),
    // Index for ticket number lookups
    ticketNumberIdx: index('late_pass_ticket_number_idx').on(table.ticketNumber),
    // Index for expiration cleanup queries
    statusExpiresIdx: index('late_pass_ticket_status_expires_idx').on(
      table.status,
      table.expiresAt
    ),
  }
})

/**
 * Configuration for late pass ticket system per organization
 *
 * Time Windows:
 * - maxGenerationDelayMinutes: How late after class start can admin generate ticket (e.g., 10min)
 * - maxAcceptanceDelayMinutes: How late after class start can student use ticket (e.g., 15min)
 *
 * Example:
 * Class starts at 9:00 AM
 * - Can generate ticket until 9:10 AM (maxGenerationDelayMinutes = 10)
 * - Student can use ticket until 9:15 AM (maxAcceptanceDelayMinutes = 15)
 * - Ticket expires at 9:15 AM
 */
export const latePassConfig = pgTable('late_pass_config', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Time windows (in minutes)
  maxGenerationDelayMinutes: integer('max_generation_delay_minutes')
    .notNull()
    .default(10), // Can issue ticket up to 10min after class starts
  maxAcceptanceDelayMinutes: integer('max_acceptance_delay_minutes')
    .notNull()
    .default(15), // Student can use ticket up to 15min after class starts
  ticketValidityDays: integer('ticket_validity_days')
    .notNull()
    .default(7), // Show upcoming classes within next 7 days

  // Behavior settings
  allowMultipleActiveTickets: boolean('allow_multiple_active_tickets')
    .default(false)
    .notNull(), // Restrict to one active ticket per student if timetable not expired
  autoExpireTickets: boolean('auto_expire_tickets')
    .default(true)
    .notNull(), // Automatically expire tickets when expiresAt passes
  requireAdminApproval: boolean('require_admin_approval')
    .default(false)
    .notNull(), // Future: require approval before ticket generation

  // PDF generation settings
  includeLogo: boolean('include_logo')
    .default(true)
    .notNull(),
  includeBarcode: boolean('include_barcode')
    .default(false)
    .notNull(), // Include 1D barcode in addition to QR
  logoPath: text('logo_path'), // Path to organization logo for PDF

  // Organization (one config per organization)
  orgId: text('org_id')
    .notNull()
    .unique()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Audit fields
  updatedByUserId: text('updated_by_user_id')
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// Relations
export const latePassTicketRelations = relations(latePassTicket, ({ one }) => ({
  student: one(user, {
    fields: [latePassTicket.studentId],
    references: [user.id],
    relationName: 'latePassTicketStudent',
  }),
  timetable: one(timetable, {
    fields: [latePassTicket.timetableId],
    references: [timetable.id],
  }),
  organization: one(organization, {
    fields: [latePassTicket.orgId],
    references: [organization.id],
  }),
  issuedBy: one(user, {
    fields: [latePassTicket.issuedByUserId],
    references: [user.id],
    relationName: 'latePassTicketIssuedBy',
  }),
  canceledBy: one(user, {
    fields: [latePassTicket.canceledByUserId],
    references: [user.id],
    relationName: 'latePassTicketCanceledBy',
  }),
}))

export const latePassConfigRelations = relations(latePassConfig, ({ one }) => ({
  organization: one(organization, {
    fields: [latePassConfig.orgId],
    references: [organization.id],
  }),
  updatedBy: one(user, {
    fields: [latePassConfig.updatedByUserId],
    references: [user.id],
    relationName: 'latePassConfigUpdatedBy',
  }),
}))

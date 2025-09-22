import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { clients } from './clients'
import { courts } from './courts'
import { caseStatusEnum, priorityEnum } from './enums'
import { opponents } from './opponents'

export const cases = pgTable(
  'cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    // Case Identification
    caseNumber: text('case_number').notNull(),
    caseTitle: text('case_title').notNull(),

    // Court Information
    courtId: uuid('court_id').references(() => courts.id),
    courtFileNumber: text('court_file_number'),

    // Parties
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    opponentId: uuid('opponent_id').references(() => opponents.id, { onDelete: 'set null' }),

    // Case Details
    caseSubject: text('case_subject').notNull(),
    // caseValue: decimal('case_value', { precision: 15, scale: 2 }),
    caseStatus: caseStatusEnum('case_status').notNull().default('new'),
    priority: priorityEnum('priority').notNull().default('medium'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
    deletedBy: text('deleted_by').references(() => user.id, { onDelete: 'set null' }),
  },
  (table) => [
    unique('cases_org_case_number_unique').on(table.organizationId, table.caseNumber),

    index('idx_cases_organization_id').on(table.organizationId),
    index('idx_cases_client_id').on(table.clientId),
    index('idx_cases_case_status').on(table.caseStatus),
    index('idx_cases_priority').on(table.priority),
    index('idx_cases_deleted_at').on(table.deletedAt),
  ]
)

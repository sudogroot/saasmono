import { index, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { cases } from './cases'
import { courts } from './courts'

export const trials = pgTable(
  'trials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    caseId: uuid('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),

    trialNumber: integer('trial_number').notNull(),
    courtId: uuid('court_id')
      .notNull()
      .references(() => courts.id),

    // Trial Details
    trialDateTime: timestamp('trial_datetime').notNull(),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdBy: text('created_by').references(() => user.id),
    updatedBy: text('updated_by').references(() => user.id),
    deletedBy: text('deleted_by').references(() => user.id),
  },
  (table) => [
    // Indexes
    index('idx_trials_organization_id').on(table.organizationId),
    index('idx_trials_case_id').on(table.caseId),
    index('idx_trials_court_id').on(table.courtId),
    index('idx_trials_trial_date_time').on(table.trialDateTime),
    index('idx_trials_deleted_at').on(table.deletedAt),
  ]
)

import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// NOT RLS  for this schema file
export const courts = pgTable(
  'courts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    state: text('state').notNull(),
    courtType: text('court_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_courts_state').on(table.state),
    index('idx_courts_name').on(table.name),
    index('idx_courts_type').on(table.courtType),
  ]
)

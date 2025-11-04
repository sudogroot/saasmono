import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const interestRequest = pgTable('interest_request', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phoneNumber: text('phone_number').notNull(),
  wantsDemo: boolean('wants_demo').notNull().default(false),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
  // Additional metadata
  notes: text('notes'),
  status: text('status').notNull().default('pending'), // pending, contacted, converted
})

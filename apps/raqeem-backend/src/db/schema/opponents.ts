import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { clientTypeEnum } from './enums'

export const opponents = pgTable(
  'opponents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    opponentType: clientTypeEnum('opponent_type').notNull().default('individual'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdBy: text('created_by').references(() => user.id),
    updatedBy: text('updated_by').references(() => user.id),
    deletedBy: text('deleted_by').references(() => user.id),
  },
  (table) => [
    index('idx_opponents_organization_id').on(table.organizationId),
    index('idx_opponents_opponent_type').on(table.opponentType),
    index('idx_opponents_name').on(table.name),
    index('idx_opponents_deleted_at').on(table.deletedAt),
  ]
)

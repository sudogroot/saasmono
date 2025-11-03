import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { clientTypeEnum } from './enums'
export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    // Personal Information
    name: text('first_name').notNull(),
    nationalId: text('national_id'),
    phone: text('phone'),
    email: text('email'),

    // Client Type and Status
    clientType: clientTypeEnum('client_type').notNull().default('individual'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  },

  (table) => [
    // Unique constraint for national ID per organization excluding soft-deleted records
    unique('clients_org_national_id_unique').on(table.organizationId, table.nationalId, table.deletedAt),

    index('idx_clients_organization_id').on(table.organizationId),
    index('idx_clients_client_type').on(table.clientType),
    index('idx_clients_deleted_at').on(table.deletedAt),
  ]
)

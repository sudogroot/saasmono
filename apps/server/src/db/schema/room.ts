import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'

// Physical rooms for sessions
export const room = pgTable('room', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Room 101", "Science Lab", "Gym"
  code: text('code').notNull(), // "R101", "LAB_SCI", "GYM"
  description: text('description'),
  capacity: text('capacity'), // Maximum occupancy
  location: text('location'), // Building, floor info

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Audit fields
  createdByUserId: text('created_by_user_id').references(() => user.id),
  updatedByUserId: text('updated_by_user_id').references(() => user.id),
  deletedByUserId: text('deleted_by_user_id').references(() => user.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
})

// Relations
export const roomRelations = relations(room, ({ one }) => ({
  organization: one(organization, {
    fields: [room.orgId],
    references: [organization.id],
  }),

  createdBy: one(user, {
    fields: [room.createdByUserId],
    references: [user.id],
    relationName: 'roomCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [room.updatedByUserId],
    references: [user.id],
    relationName: 'roomUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [room.deletedByUserId],
    references: [user.id],
    relationName: 'roomDeletedBy',
  }),
}))
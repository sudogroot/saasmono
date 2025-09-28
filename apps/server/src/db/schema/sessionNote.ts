import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { sessionInstance } from './sessionInstance'

// Session notes - for tracking what happened in a session
export const sessionNote = pgTable('session_note', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(), // Private to teacher vs visible to students/parents

  sessionInstanceId: uuid('session_instance_id')
    .notNull()
    .references(() => sessionInstance.id, { onDelete: 'cascade' }),

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Audit fields
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => user.id),
  updatedByUserId: text('updated_by_user_id').references(() => user.id),
  deletedByUserId: text('deleted_by_user_id').references(() => user.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
})

// Session note attachments - for files attached to session notes
export const sessionNoteAttachment = pgTable('session_note_attachment', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: text('file_name').notNull(), // Original filename
  fileUrl: text('file_url').notNull(), // URL/path to the stored file
  fileSize: text('file_size'), // File size in bytes
  mimeType: text('mime_type'), // MIME type (image/jpeg, application/pdf, etc.)
  description: text('description'), // Optional description of the attachment

  sessionNoteId: uuid('session_note_id')
    .notNull()
    .references(() => sessionNote.id, { onDelete: 'cascade' }),

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Audit fields
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => user.id),
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
export const sessionNoteRelations = relations(sessionNote, ({ many, one }) => ({
  attachments: many(sessionNoteAttachment),

  sessionInstance: one(sessionInstance, {
    fields: [sessionNote.sessionInstanceId],
    references: [sessionInstance.id],
  }),
  organization: one(organization, {
    fields: [sessionNote.orgId],
    references: [organization.id],
  }),

  createdBy: one(user, {
    fields: [sessionNote.createdByUserId],
    references: [user.id],
    relationName: 'sessionNoteCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [sessionNote.updatedByUserId],
    references: [user.id],
    relationName: 'sessionNoteUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [sessionNote.deletedByUserId],
    references: [user.id],
    relationName: 'sessionNoteDeletedBy',
  }),
}))

export const sessionNoteAttachmentRelations = relations(sessionNoteAttachment, ({ one }) => ({
  sessionNote: one(sessionNote, {
    fields: [sessionNoteAttachment.sessionNoteId],
    references: [sessionNote.id],
  }),
  organization: one(organization, {
    fields: [sessionNoteAttachment.orgId],
    references: [organization.id],
  }),

  createdBy: one(user, {
    fields: [sessionNoteAttachment.createdByUserId],
    references: [user.id],
    relationName: 'sessionNoteAttachmentCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [sessionNoteAttachment.updatedByUserId],
    references: [user.id],
    relationName: 'sessionNoteAttachmentUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [sessionNoteAttachment.deletedByUserId],
    references: [user.id],
    relationName: 'sessionNoteAttachmentDeletedBy',
  }),
}))
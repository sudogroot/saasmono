import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'

export type InstitutionLevelType = 'JARDIN' | 'PRIMAIRE' | 'COLLEGE' | 'SECONDAIRE' | 'SUPERIEUR'

export const institutionLevelEnum = pgEnum('institution_level_ENUM', [
  'JARDIN',
  'PRIMAIRE',
  'COLLEGE',
  'SECONDAIRE',
  'SUPERIEUR',
])

export const institutionLevel = pgTable('institution_level', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: institutionLevelEnum('name').notNull(),
  displayNameEn: text('display_name_en').notNull(),
  displayNameAr: text('display_name_ar').notNull(),
  displayNameFr: text('display_name_fr').notNull(),
})

export const educationLevel = pgTable('education_level', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionLevelId: uuid('institution_level_id')
    .notNull()
    .references(() => institutionLevel.id),
  section: text('section'), // A, B, C, D, E, etc.
  level: integer('level').notNull(),
  displayNameEn: text('display_name_en'),
  displayNameFr: text('display_name_fr'),
  displayNameAr: text('display_name_ar'),
  isDefault: boolean('is_default').default(true).notNull(),
  orgId: text('org_id')
    .notNull()
    .references(() => organization.id),

  // Audit fields
  createdByUserId: text('created_by_user_id').references(() => user.id),
  updatedByUserId: text('updated_by_user_id').references(() => user.id),
  deletedByUserId: text('deleted_by_user_id').references(() => user.id),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const educationSubject = pgTable('education_subject', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionLevelId: uuid('institution_level_id')
    .notNull()
    .references(() => institutionLevel.id),
  name: text('name').notNull(),
  description: text('description'),
  displayNameEn: text('display_name_en').notNull(),
  displayNameFr: text('display_name_fr').notNull(),
  displayNameAr: text('display_name_ar').notNull(),
  displayDescriptionEn: text('display_description_en'),
  displayDescriptionFr: text('display_description_fr'),
  displayDescriptionAr: text('display_description_ar'),

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id),

  // Audit fields
  createdByUserId: text('created_by_user_id').references(() => user.id),
  updatedByUserId: text('updated_by_user_id').references(() => user.id),
  deletedByUserId: text('deleted_by_user_id').references(() => user.id),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

// Junction table for many-to-many relationship between EducationLevel and EducationSubject
export const educationLevelSubject = pgTable(
  'education_level_subject',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    educationLevelId: uuid('education_level_id')
      .notNull()
      .references(() => educationLevel.id, { onDelete: 'cascade' }),
    educationSubjectId: uuid('education_subject_id')
      .notNull()
      .references(() => educationSubject.id, { onDelete: 'cascade' }),

    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    isOptional: boolean('is_optional').notNull().default(false),

    // Audit fields
    createdByUserId: text('created_by_user_id').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      levelSubjectIdx: index('education_level_subject_level_subject_idx').on(
        table.educationLevelId,
        table.educationSubjectId
      ),
    }
  }
)

// Relations
export const educationLevelRelations = relations(educationLevel, ({ many, one }) => ({
  // Many-to-many with subjects through junction table
  levelSubjects: many(educationLevelSubject),

  // Audit relations
  createdBy: one(user, {
    fields: [educationLevel.createdByUserId],
    references: [user.id],
    relationName: 'educationLevelCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [educationLevel.updatedByUserId],
    references: [user.id],
    relationName: 'educationLevelUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [educationLevel.deletedByUserId],
    references: [user.id],
    relationName: 'educationLevelDeletedBy',
  }),
}))

export const educationSubjectRelations = relations(educationSubject, ({ many, one }) => ({
  // Many-to-many with levels through junction table
  subjectLevels: many(educationLevelSubject),

  // Audit relations
  createdBy: one(user, {
    fields: [educationSubject.createdByUserId],
    references: [user.id],
    relationName: 'educationSubjectCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [educationSubject.updatedByUserId],
    references: [user.id],
    relationName: 'educationSubjectUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [educationSubject.deletedByUserId],
    references: [user.id],
    relationName: 'educationSubjectDeletedBy',
  }),
}))

export const educationLevelSubjectRelations = relations(educationLevelSubject, ({ one }) => ({
  educationLevel: one(educationLevel, {
    fields: [educationLevelSubject.educationLevelId],
    references: [educationLevel.id],
  }),
  educationSubject: one(educationSubject, {
    fields: [educationLevelSubject.educationSubjectId],
    references: [educationSubject.id],
  }),
  createdBy: one(user, {
    fields: [educationLevelSubject.createdByUserId],
    references: [user.id],
    relationName: 'educationLevelSubjectCreatedBy',
  }),
}))

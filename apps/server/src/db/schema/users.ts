import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { educationLevel, educationSubject } from './education'

export const parentStudentRelation = pgTable('parent_student_relation', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: text('parent_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type').default('parent').notNull(), // parent, guardian, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const organizationConfig = pgTable('organization_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  institutionLevels: text('institution_levels').array().notNull(), // Array of institution levels
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const teacherEducationSubjectLevelAssignment = pgTable('teacher_education_subject_level_assignment', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherId: text('teacher_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  educationSubjectId: uuid('education_subject_id')
    .notNull()
    .references(() => educationSubject.id, { onDelete: 'cascade' }),
  educationLevelId: uuid('education_level_id')
    .notNull()
    .references(() => educationLevel.id, { onDelete: 'cascade' }),
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

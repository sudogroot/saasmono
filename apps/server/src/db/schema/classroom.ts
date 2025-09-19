import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { educationLevel, educationSubject } from './education'

// Main class/grade entity
export const classroom = pgTable('classroom', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "Class 3A", "Grade 10 Science"
  code: text('code').notNull(), // e.g., "3A", "10SCI"
  academicYear: text('academic_year').notNull(), // e.g., "2024-2025"
  capacity: integer('capacity'), // Maximum number of students

  // References
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

// Students assigned to classes
export const classroomStudentEnrollment = pgTable('classroom_student_enrollment', {
  id: uuid('id').primaryKey().defaultRandom(),
  classroomId: uuid('classroom_id')
    .notNull()
    .references(() => classroom.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  enrollmentDate: timestamp('enrollment_date').defaultNow().notNull(),
  status: text('status').default('active').notNull(), // active, inactive, transferred

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

// Teachers assigned to teach specific subjects in specific classes
export const classroomTeacherAssignment = pgTable('classroom_teacher_assignment', {
  id: uuid('id').primaryKey().defaultRandom(),
  classroomId: uuid('classroom_id')
    .notNull()
    .references(() => classroom.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  educationSubjectId: uuid('education_subject_id')
    .notNull()
    .references(() => educationSubject.id, { onDelete: 'cascade' }),

  // Role in this specific class-subject assignment
  role: text('role').default('teacher').notNull(), // teacher, assistant, substitute
  isMainTeacher: text('is_main_teacher').default('false').notNull(), // Main teacher for this subject in this class

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

// Flexible grouping system for dividing classes
export const classroomGroup = pgTable('classroom_group', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Group A", "Group B", "All Students", "Advanced", "Beginner"
  code: text('code').notNull(), // "GRP_A", "GRP_B", "ALL", "ADV", "BEG"
  description: text('description'),
  maxCapacity: integer('max_capacity'), // Maximum students in this group
  isDefault: boolean('is_default').default(false).notNull(), // Is this the default "all students" group

  classroomId: uuid('classroom_id')
    .notNull()
    .references(() => classroom.id, { onDelete: 'cascade' }),
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

// Students assigned to specific groups within a classroom
export const classroomGroupMembership = pgTable('classroom_group_membership', {
  id: uuid('id').primaryKey().defaultRandom(),
  classroomGroupId: uuid('classroom_group_id')
    .notNull()
    .references(() => classroomGroup.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Flexible assignment - can be subject-specific or general
  educationSubjectId: uuid('education_subject_id'), // Optional: group for specific subject only
  isActive: boolean('is_active').default(true).notNull(),

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Audit fields
  createdByUserId: text('created_by_user_id').references(() => user.id),
  updatedByUserId: text('updated_by_user_id').references(() => user.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// Relations
export const classroomRelations = relations(classroom, ({ many, one }) => ({
  // Many students enrolled in this classroom
  studentEnrollments: many(classroomStudentEnrollment),

  // Many teacher assignments for this classroom
  teacherAssignments: many(classroomTeacherAssignment),

  // Many groups within this classroom
  groups: many(classroomGroup),

  // One education level for this classroom
  educationLevel: one(educationLevel, {
    fields: [classroom.educationLevelId],
    references: [educationLevel.id],
  }),

  // Belongs to one organization
  organization: one(organization, {
    fields: [classroom.orgId],
    references: [organization.id],
  }),

  // Audit relations
  createdBy: one(user, {
    fields: [classroom.createdByUserId],
    references: [user.id],
    relationName: 'classroomCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [classroom.updatedByUserId],
    references: [user.id],
    relationName: 'classroomUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [classroom.deletedByUserId],
    references: [user.id],
    relationName: 'classroomDeletedBy',
  }),
}))

export const classroomStudentEnrollmentRelations = relations(classroomStudentEnrollment, ({ one }) => ({
  classroom: one(classroom, {
    fields: [classroomStudentEnrollment.classroomId],
    references: [classroom.id],
  }),
  student: one(user, {
    fields: [classroomStudentEnrollment.studentId],
    references: [user.id],
    relationName: 'studentEnrollment',
  }),
  organization: one(organization, {
    fields: [classroomStudentEnrollment.orgId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [classroomStudentEnrollment.createdByUserId],
    references: [user.id],
    relationName: 'enrollmentCreatedBy',
  }),
}))

export const classroomTeacherAssignmentRelations = relations(classroomTeacherAssignment, ({ one }) => ({
  classroom: one(classroom, {
    fields: [classroomTeacherAssignment.classroomId],
    references: [classroom.id],
  }),
  teacher: one(user, {
    fields: [classroomTeacherAssignment.teacherId],
    references: [user.id],
    relationName: 'teacherAssignment',
  }),
  educationSubject: one(educationSubject, {
    fields: [classroomTeacherAssignment.educationSubjectId],
    references: [educationSubject.id],
  }),
  organization: one(organization, {
    fields: [classroomTeacherAssignment.orgId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [classroomTeacherAssignment.createdByUserId],
    references: [user.id],
    relationName: 'teacherAssignmentCreatedBy',
  }),
}))

export const classroomGroupRelations = relations(classroomGroup, ({ many, one }) => ({
  memberships: many(classroomGroupMembership),
  classroom: one(classroom, {
    fields: [classroomGroup.classroomId],
    references: [classroom.id],
  }),
  organization: one(organization, {
    fields: [classroomGroup.orgId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [classroomGroup.createdByUserId],
    references: [user.id],
    relationName: 'classroomGroupCreatedBy',
  }),
}))

export const classroomGroupMembershipRelations = relations(classroomGroupMembership, ({ one }) => ({
  classroomGroup: one(classroomGroup, {
    fields: [classroomGroupMembership.classroomGroupId],
    references: [classroomGroup.id],
  }),
  student: one(user, {
    fields: [classroomGroupMembership.studentId],
    references: [user.id],
    relationName: 'groupMembershipStudent',
  }),
  organization: one(organization, {
    fields: [classroomGroupMembership.orgId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [classroomGroupMembership.createdByUserId],
    references: [user.id],
    relationName: 'groupMembershipCreatedBy',
  }),
}))

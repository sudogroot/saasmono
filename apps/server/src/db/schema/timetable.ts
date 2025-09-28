import { relations } from 'drizzle-orm'
import { index, json, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { classroom, classroomGroup } from './classroom'
import { educationSubject } from './education'
import { room } from './room'

// Enums for session status
export const sessionStatusEnum = pgEnum('session_status', [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
])

// Session instances - specific timetable sessions with full datetime
export const timetable = pgTable('timetable', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(), // "Math Class", "Physics Lab"

  // Full datetime approach for easy import and precise scheduling
  startDateTime: timestamp('start_datetime').notNull(), // 2024-03-15 09:00:00
  endDateTime: timestamp('end_datetime').notNull(),     // 2024-03-15 10:30:00

  status: sessionStatusEnum('status').notNull().default('SCHEDULED'),

  // Flexible association - either classroom OR classroomGroup
  classroomId: uuid('classroom_id').references(() => classroom.id, { onDelete: 'cascade' }),
  classroomGroupId: uuid('classroom_group_id').references(() => classroomGroup.id, { onDelete: 'cascade' }),

  // Required associations
  teacherId: text('teacher_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  educationSubjectId: uuid('education_subject_id')
    .notNull()
    .references(() => educationSubject.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id')
    .notNull()
    .references(() => room.id, { onDelete: 'cascade' }),

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Session-specific data
  actualStartDateTime: timestamp('actual_start_datetime'), // When session actually started
  actualEndDateTime: timestamp('actual_end_datetime'), // When session actually ended
  notes: text('notes'), // Session notes
  additionalData: json('additional_data'), // Flexible field for extra info

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
}, (table) => {
  return {
    // Ensure either classroom or classroomGroup is set, not both
    classroomOrGroupIdx: index('timetable_classroom_or_group_idx').on(
      table.classroomId,
      table.classroomGroupId
    ),
    // Performance indexes for common queries
    startDateTimeStatusIdx: index('timetable_start_datetime_status_idx').on(
      table.startDateTime,
      table.status
    ),
    teacherDateTimeIdx: index('timetable_teacher_datetime_idx').on(
      table.teacherId,
      table.startDateTime
    ),
    orgDateTimeIdx: index('timetable_org_datetime_idx').on(
      table.orgId,
      table.startDateTime
    ),
    classroomDateTimeIdx: index('timetable_classroom_datetime_idx').on(
      table.classroomId,
      table.startDateTime
    ),
    subjectDateTimeIdx: index('timetable_subject_datetime_idx').on(
      table.educationSubjectId,
      table.startDateTime
    ),
  }
})

// Relations
export const timetableRelations = relations(timetable, ({ one }) => ({
  classroom: one(classroom, {
    fields: [timetable.classroomId],
    references: [classroom.id],
  }),
  classroomGroup: one(classroomGroup, {
    fields: [timetable.classroomGroupId],
    references: [classroomGroup.id],
  }),
  teacher: one(user, {
    fields: [timetable.teacherId],
    references: [user.id],
    relationName: 'timetableTeacher',
  }),
  educationSubject: one(educationSubject, {
    fields: [timetable.educationSubjectId],
    references: [educationSubject.id],
  }),
  room: one(room, {
    fields: [timetable.roomId],
    references: [room.id],
  }),
  organization: one(organization, {
    fields: [timetable.orgId],
    references: [organization.id],
  }),

  createdBy: one(user, {
    fields: [timetable.createdByUserId],
    references: [user.id],
    relationName: 'timetableCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [timetable.updatedByUserId],
    references: [user.id],
    relationName: 'timetableUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [timetable.deletedByUserId],
    references: [user.id],
    relationName: 'timetableDeletedBy',
  }),
}))
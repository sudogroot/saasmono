import { relations } from 'drizzle-orm'
import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { timetable } from './timetable'

// Enums for attendance status
export const attendanceStatusEnum = pgEnum('attendance_status', [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
  'SICK'
])

// Attendance session - groups all attendance records for a timetable session
export const attendanceSession = pgTable('attendance_session', {
  id: uuid('id').primaryKey().defaultRandom(),
  timetableId: uuid('timetable_id')
    .notNull()
    .references(() => timetable.id, { onDelete: 'cascade' }),
  generalNotes: text('general_notes'), // Overall notes for this attendance session

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
}, (table) => {
  return {
    // Index for quick lookup
    timetableIdx: index('attendance_session_timetable_idx').on(table.timetableId),
    orgIdx: index('attendance_session_org_idx').on(table.orgId),
  }
})

// Attendance records for specific session instances
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: attendanceStatusEnum('status').notNull(),
  note: text('note'), // Reason for absence, late arrival, etc.

  // Required associations
  attendanceSessionId: uuid('attendance_session_id')
    .references(() => attendanceSession.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  timetableId: uuid('timetable_id')
    .notNull()
    .references(() => timetable.id, { onDelete: 'cascade' }),

  orgId: text('org_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Timing info
  markedAt: timestamp('marked_at').defaultNow().notNull(), // When attendance was recorded
  arrivedAt: timestamp('arrived_at'), // Actual arrival time (for late students)

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
    // Unique constraint: one attendance record per student per session
    studentSessionIdx: index('attendance_student_session_idx').on(
      table.studentId,
      table.timetableId
    ),
    // Performance indexes
    sessionStatusIdx: index('attendance_session_status_idx').on(
      table.timetableId,
      table.status
    ),
    studentMarkedAtIdx: index('attendance_student_marked_at_idx').on(
      table.studentId,
      table.markedAt
    ),
    orgMarkedAtIdx: index('attendance_org_marked_at_idx').on(
      table.orgId,
      table.markedAt
    ),
  }
})

// Relations
export const attendanceSessionRelations = relations(attendanceSession, ({ one, many }) => ({
  timetable: one(timetable, {
    fields: [attendanceSession.timetableId],
    references: [timetable.id],
  }),
  organization: one(organization, {
    fields: [attendanceSession.orgId],
    references: [organization.id],
  }),
  attendances: many(attendance),
  createdBy: one(user, {
    fields: [attendanceSession.createdByUserId],
    references: [user.id],
    relationName: 'attendanceSessionCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [attendanceSession.updatedByUserId],
    references: [user.id],
    relationName: 'attendanceSessionUpdatedBy',
  }),
}))

export const attendanceRelations = relations(attendance, ({ one }) => ({
  attendanceSession: one(attendanceSession, {
    fields: [attendance.attendanceSessionId],
    references: [attendanceSession.id],
  }),
  student: one(user, {
    fields: [attendance.studentId],
    references: [user.id],
    relationName: 'attendanceStudent',
  }),
  timetable: one(timetable, {
    fields: [attendance.timetableId],
    references: [timetable.id],
  }),
  organization: one(organization, {
    fields: [attendance.orgId],
    references: [organization.id],
  }),

  createdBy: one(user, {
    fields: [attendance.createdByUserId],
    references: [user.id],
    relationName: 'attendanceCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [attendance.updatedByUserId],
    references: [user.id],
    relationName: 'attendanceUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [attendance.deletedByUserId],
    references: [user.id],
    relationName: 'attendanceDeletedBy',
  }),
}))
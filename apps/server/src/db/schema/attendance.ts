import { relations } from 'drizzle-orm'
import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { sessionInstance } from './sessionInstance'

// Enums for attendance status
export const attendanceStatusEnum = pgEnum('attendance_status', [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
  'SICK'
])

// Attendance records for specific session instances
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: attendanceStatusEnum('status').notNull(),
  note: text('note'), // Reason for absence, late arrival, etc.

  // Required associations
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  sessionInstanceId: uuid('session_instance_id')
    .notNull()
    .references(() => sessionInstance.id, { onDelete: 'cascade' }),

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
      table.sessionInstanceId
    ),
    // Performance indexes
    sessionStatusIdx: index('attendance_session_status_idx').on(
      table.sessionInstanceId,
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
export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(user, {
    fields: [attendance.studentId],
    references: [user.id],
    relationName: 'attendanceStudent',
  }),
  sessionInstance: one(sessionInstance, {
    fields: [attendance.sessionInstanceId],
    references: [sessionInstance.id],
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
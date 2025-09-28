import { relations } from 'drizzle-orm'
import { boolean, index, json, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organization, user } from './auth'
import { classroom, classroomGroup } from './classroom'
import { educationSubject } from './education'

// Enums for attendance and session status
export const attendanceStatusEnum = pgEnum('attendance_status', [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
  'SICK'
])

export const sessionStatusEnum = pgEnum('session_status', [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
])

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

// Session instances - specific timetable sessions with full datetime
export const sessionInstance = pgTable('session_instance', {
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
    classroomOrGroupIdx: index('session_instance_classroom_or_group_idx').on(
      table.classroomId,
      table.classroomGroupId
    ),
    // Performance indexes for common queries
    startDateTimeStatusIdx: index('session_instance_start_datetime_status_idx').on(
      table.startDateTime,
      table.status
    ),
    teacherDateTimeIdx: index('session_instance_teacher_datetime_idx').on(
      table.teacherId,
      table.startDateTime
    ),
    orgDateTimeIdx: index('session_instance_org_datetime_idx').on(
      table.orgId,
      table.startDateTime
    ),
    classroomDateTimeIdx: index('session_instance_classroom_datetime_idx').on(
      table.classroomId,
      table.startDateTime
    ),
    subjectDateTimeIdx: index('session_instance_subject_datetime_idx').on(
      table.educationSubjectId,
      table.startDateTime
    ),
  }
})

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
export const roomRelations = relations(room, ({ many, one }) => ({
  sessionInstances: many(sessionInstance),

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

export const sessionInstanceRelations = relations(sessionInstance, ({ many, one }) => ({
  attendances: many(attendance),
  sessionNotes: many(sessionNote),

  classroom: one(classroom, {
    fields: [sessionInstance.classroomId],
    references: [classroom.id],
  }),
  classroomGroup: one(classroomGroup, {
    fields: [sessionInstance.classroomGroupId],
    references: [classroomGroup.id],
  }),
  teacher: one(user, {
    fields: [sessionInstance.teacherId],
    references: [user.id],
    relationName: 'sessionInstanceTeacher',
  }),
  educationSubject: one(educationSubject, {
    fields: [sessionInstance.educationSubjectId],
    references: [educationSubject.id],
  }),
  room: one(room, {
    fields: [sessionInstance.roomId],
    references: [room.id],
  }),
  organization: one(organization, {
    fields: [sessionInstance.orgId],
    references: [organization.id],
  }),

  createdBy: one(user, {
    fields: [sessionInstance.createdByUserId],
    references: [user.id],
    relationName: 'sessionInstanceCreatedBy',
  }),
  updatedBy: one(user, {
    fields: [sessionInstance.updatedByUserId],
    references: [user.id],
    relationName: 'sessionInstanceUpdatedBy',
  }),
  deletedBy: one(user, {
    fields: [sessionInstance.deletedByUserId],
    references: [user.id],
    relationName: 'sessionInstanceDeletedBy',
  }),
}))

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
import { z } from 'zod'

// Attendance Schema
export const AttendanceSchema = z.object({
  id: z.uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
  note: z.string().nullable(),
  studentId: z.string(),
  sessionInstanceId: z.uuid(),
  orgId: z.string(),
  markedAt: z.date(),
  arrivedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  // Joined data
  student: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  sessionInstance: z.object({
    id: z.uuid(),
    title: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
  }),
})

// Attendance List Item Schema (simplified for list views)
export const AttendanceListItemSchema = z.object({
  id: z.uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
  note: z.string().nullable(),
  studentId: z.string(),
  sessionInstanceId: z.uuid(),
  markedAt: z.date(),
  arrivedAt: z.date().nullable(),
  student: z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
  sessionInstance: z.object({
    id: z.uuid(),
    title: z.string(),
    startDateTime: z.date(),
  }),
})

// Input Schemas for Creating/Updating
export const CreateAttendanceInputSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
  note: z.string().optional(),
  studentId: z.string().min(1, 'Student is required'),
  sessionInstanceId: z.uuid(),
  arrivedAt: z.date().optional(),
})

export const UpdateAttendanceInputSchema = CreateAttendanceInputSchema.partial().omit({
  studentId: true,
  sessionInstanceId: true
})

// Bulk attendance creation for multiple students
export const CreateBulkAttendanceInputSchema = z.object({
  sessionInstanceId: z.uuid(),
  attendances: z.array(z.object({
    studentId: z.string().min(1, 'Student is required'),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
    note: z.string().optional(),
    arrivedAt: z.date().optional(),
  })).min(1, 'At least one attendance record is required'),
})

// Query Schemas
export const AttendanceQuerySchema = z.object({
  sessionInstanceId: z.uuid().optional(),
  studentId: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  classroomId: z.uuid().optional(),
  educationSubjectId: z.uuid().optional(),
})

// Attendance summary schemas
export const AttendanceSummarySchema = z.object({
  sessionInstanceId: z.uuid(),
  sessionTitle: z.string(),
  sessionStartDateTime: z.date(),
  totalStudents: z.number(),
  presentCount: z.number(),
  absentCount: z.number(),
  lateCount: z.number(),
  excusedCount: z.number(),
  sickCount: z.number(),
  notMarkedCount: z.number(),
})

export const StudentAttendanceSummarySchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  studentLastName: z.string(),
  totalSessions: z.number(),
  presentCount: z.number(),
  absentCount: z.number(),
  lateCount: z.number(),
  excusedCount: z.number(),
  sickCount: z.number(),
  attendanceRate: z.number(), // Percentage
})

// Type exports
export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceListItem = z.infer<typeof AttendanceListItemSchema>
export type CreateAttendanceInput = z.infer<typeof CreateAttendanceInputSchema>
export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceInputSchema>
export type CreateBulkAttendanceInput = z.infer<typeof CreateBulkAttendanceInputSchema>
export type AttendanceQuery = z.infer<typeof AttendanceQuerySchema>
export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>
export type StudentAttendanceSummary = z.infer<typeof StudentAttendanceSummarySchema>
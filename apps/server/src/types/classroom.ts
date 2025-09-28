import { z } from 'zod'

// Base Classroom Schema
export const ClassroomSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  academicYear: z.string(),
  capacity: z.number().nullable(),
  educationLevelId: z.uuid(),
  orgId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  educationLevel: z.object({
    id: z.uuid(),
    level: z.number(),
    section: z.string().nullable(),
    displayNameAr: z.string().nullable(),
    displayNameEn: z.string().nullable(),
    displayNameFr: z.string().nullable(),
  }),
  studentCount: z.number().optional(),
  teacherCount: z.number().optional(),
})

// Classroom List Item Schema (simplified for list views)
export const ClassroomListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  academicYear: z.string(),
  educationLevelId: z.uuid(),
  educationLevel: z.object({
    id: z.uuid(),
    level: z.number(),
    section: z.string().nullable(),
    displayNameAr: z.string().nullable(),
  }),
  studentCount: z.number(),
  teacherCount: z.number(),
})

// Classroom Student Enrollment Schema
export const ClassroomStudentEnrollmentSchema = z.object({
  id: z.uuid(),
  classroomId: z.uuid(),
  studentId: z.string(),
  enrollmentDate: z.date(),
  status: z.string(),
  createdAt: z.date(),
  student: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.email(),
  }),
})

// Classroom Teacher Assignment Schema
export const ClassroomTeacherAssignmentSchema = z.object({
  id: z.uuid(),
  classroomId: z.uuid(),
  teacherId: z.string(),
  educationSubjectId: z.uuid(),
  role: z.string(),
  isMainTeacher: z.string(),
  createdAt: z.date(),
  teacher: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.email(),
  }),
  educationSubject: z.object({
    id: z.uuid(),
    name: z.string(),
    displayNameAr: z.string(),
  }),
})

// Classroom Group Schema
export const ClassroomGroupListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  maxCapacity: z.number().nullable(),
  isDefault: z.boolean(),
  classroomId: z.uuid(),
  classroomName: z.string(),
  classroomAcademicYear: z.string(),
})

// Type exports
export type Classroom = z.infer<typeof ClassroomSchema>
export type ClassroomListItem = z.infer<typeof ClassroomListItemSchema>
export type ClassroomStudentEnrollment = z.infer<typeof ClassroomStudentEnrollmentSchema>
export type ClassroomTeacherAssignment = z.infer<typeof ClassroomTeacherAssignmentSchema>
export type ClassroomGroupListItem = z.infer<typeof ClassroomGroupListItemSchema>

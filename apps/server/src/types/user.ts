import { z } from 'zod'

// User Types
export type UserType = 'teacher' | 'student' | 'parent' | 'staff'

export const UserTypeSchema = z.enum(['teacher', 'student', 'parent', 'staff'])

// Input Schemas
export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  userType: UserTypeSchema.optional(),
})

export const CreateParentStudentRelationSchema = z.object({
  parentId: z.string().min(1),
  studentId: z.string().min(1),
  relationshipType: z.string().optional().default('parent'),
})

export const CreateTeacherAssignmentSchema = z.object({
  teacherId: z.string().min(1),
  educationSubjectId: z.string().uuid(),
  educationLevelId: z.string().uuid(),
})

export const UpdateTeacherAssignmentSchema = z.object({
  educationSubjectId: z.string().uuid().optional(),
  educationLevelId: z.string().uuid().optional(),
})

// Output Schemas - Using coerce for date strings from API
export const ParentStudentRelationSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  studentId: z.string(),
  relationshipType: z.string(),
  parentName: z.string(),
  parentLastName: z.string(),
  studentName: z.string(),
  studentLastName: z.string(),
  createdAt: z.coerce.date(),
})

export const TeacherAssignmentSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  educationSubjectId: z.string(),
  educationLevelId: z.string(),
  orgId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
})

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  userType: UserTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  parentChildrenRelations: z.array(ParentStudentRelationSchema),
  teacherAssignments: z.array(TeacherAssignmentSchema),
})

export const UserListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  userType: UserTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

// Type exports
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
export type CreateParentStudentRelationInput = z.infer<typeof CreateParentStudentRelationSchema>
export type CreateTeacherAssignmentInput = z.infer<typeof CreateTeacherAssignmentSchema>
export type UpdateTeacherAssignmentInput = z.infer<typeof UpdateTeacherAssignmentSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type UserListItem = z.infer<typeof UserListItemSchema>
export type ParentStudentRelation = z.infer<typeof ParentStudentRelationSchema>
export type TeacherAssignment = z.infer<typeof TeacherAssignmentSchema>

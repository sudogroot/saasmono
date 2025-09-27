import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createStudentManagementService } from '../../services/managment/students'
import {
  CreateStudentEnrollmentSchema,
  CreateStudentGroupMembershipSchema,
  StudentDetailedResponseSchema,
  StudentEnrollmentSchema,
  StudentGroupMembershipSchema,
  StudentListItemSchema,
  SuccessResponseSchema,
  UpdateStudentEnrollmentStatusSchema,
  UpdateStudentGroupMembershipStatusSchema,
} from '../../types/user'

const studentService = createStudentManagementService(db)

export const studentManagementRouter = {
  getStudentById: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid().describe('Student ID'),
      })
    )
    .output(StudentDetailedResponseSchema)
    .route({
      method: 'GET',
      path: '/management/students/{studentId}',
      tags: ['Student Management'],
      summary: 'Get detailed student information',
      description: 'Retrieves comprehensive student details including parents, classroom, groups, subjects and teachers',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await studentService.getStudentById(input.studentId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch student details')
      }
    }),

  getStudentsList: protectedProcedure
    .input(
      z.object({
        classroomId: z.string().uuid().optional().describe('Filter by classroom ID'),
        educationLevelId: z.string().uuid().optional().describe('Filter by education level ID'),
      }).optional()
    )
    .output(z.array(StudentListItemSchema))
    .route({
      method: 'GET',
      path: '/management/students/list',
      tags: ['Student Management'],
      summary: 'List students',
      description: 'Retrieves students with basic info and classroom, optionally filtered by classroom or education level',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await studentService.getStudentsList(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch students')
      }
    }),

  createStudentEnrollment: protectedProcedure
    .input(CreateStudentEnrollmentSchema)
    .output(StudentEnrollmentSchema)
    .route({
      method: 'POST',
      path: '/management/student-enrollments',
      tags: ['Student Management'],
      summary: 'Enroll student in classroom',
      description: 'Creates a new enrollment for a student in a specific classroom',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await studentService.createStudentEnrollment(orgId, {
          ...input,
          createdByUserId: currentUserId,
        })
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create student enrollment')
      }
    }),

  updateStudentEnrollmentStatus: protectedProcedure
    .input(UpdateStudentEnrollmentStatusSchema)
    .output(StudentEnrollmentSchema)
    .route({
      method: 'PUT',
      path: '/management/student-enrollments/{enrollmentId}/status',
      tags: ['Student Management'],
      summary: 'Update student enrollment status',
      description: 'Updates the status of a student enrollment (active, inactive, transferred)',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await studentService.updateStudentEnrollmentStatus(
          orgId,
          input.enrollmentId,
          input.status,
          currentUserId
        )
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update enrollment status')
      }
    }),

  createStudentGroupMembership: protectedProcedure
    .input(CreateStudentGroupMembershipSchema)
    .output(StudentGroupMembershipSchema)
    .route({
      method: 'POST',
      path: '/management/student-group-memberships',
      tags: ['Student Management'],
      summary: 'Add student to group',
      description: 'Creates a new group membership for a student in a specific classroom group',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await studentService.createStudentGroupMembership(orgId, {
          ...input,
          createdByUserId: currentUserId,
        })
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create group membership')
      }
    }),

  updateStudentGroupMembershipStatus: protectedProcedure
    .input(UpdateStudentGroupMembershipStatusSchema)
    .output(StudentGroupMembershipSchema)
    .route({
      method: 'PUT',
      path: '/management/student-group-memberships/{membershipId}/status',
      tags: ['Student Management'],
      summary: 'Update group membership status',
      description: 'Updates the active status of a student group membership',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const currentUserId = getCurrentUserId(context)
      try {
        return await studentService.updateStudentGroupMembershipStatus(
          orgId,
          input.membershipId,
          input.isActive,
          currentUserId
        )
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update group membership status')
      }
    }),

}
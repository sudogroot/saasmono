import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createAttendanceManagementService } from '../../services/managment/attendances'
import {
  AttendanceListItemSchema,
  AttendanceQuerySchema,
  AttendanceSchema,
  AttendanceSummarySchema,
  CreateAttendanceInputSchema,
  CreateBulkAttendanceInputSchema,
  StudentAttendanceSummarySchema,
  UpdateAttendanceInputSchema
} from '../../types/attendance'

const attendanceService = createAttendanceManagementService(db)

export const attendanceManagementRouter = {
  // Attendance Records
  getAttendancesList: protectedProcedure
    .input(AttendanceQuerySchema.optional())
    .output(z.array(AttendanceListItemSchema))
    .route({
      method: 'GET',
      path: '/management/attendances',
      tags: ['Attendance Management'],
      summary: 'List attendance records',
      description: 'Retrieves all attendance records with optional filtering',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getAttendancesList(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch attendance records')
      }
    }),

  getAttendanceById: protectedProcedure
    .input(
      z.object({
        attendanceId: z.uuid().describe('Attendance ID'),
      })
    )
    .output(AttendanceSchema)
    .route({
      method: 'GET',
      path: '/management/attendances/{attendanceId}',
      tags: ['Attendance Management'],
      summary: 'Get attendance record',
      description: 'Retrieves a single attendance record by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getAttendanceById(input.attendanceId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch attendance record')
      }
    }),

  createAttendance: protectedProcedure
    .input(CreateAttendanceInputSchema)
    .output(AttendanceSchema.omit({
      student: true,
      timetable: true,
    }))
    .route({
      method: 'POST',
      path: '/management/attendances',
      tags: ['Attendance Management'],
      summary: 'Create attendance record',
      description: 'Creates a new attendance record for a student in a session',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await attendanceService.createAttendance(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create attendance record')
      }
    }),

  createBulkAttendance: protectedProcedure
    .input(CreateBulkAttendanceInputSchema)
    .output(z.object({
      created: z.number(),
      skipped: z.number(),
      records: z.array(z.object({
        id: z.uuid(),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
        studentId: z.string(),
        timetableId: z.uuid(),
      }))
    }))
    .route({
      method: 'POST',
      path: '/management/attendances/bulk',
      tags: ['Attendance Management'],
      summary: 'Create bulk attendance records',
      description: 'Creates multiple attendance records for a session',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await attendanceService.createBulkAttendance(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create bulk attendance records')
      }
    }),

  updateAttendance: protectedProcedure
    .input(
      z.object({
        attendanceId: z.uuid().describe('Attendance ID'),
        data: UpdateAttendanceInputSchema,
      })
    )
    .output(AttendanceSchema.omit({
      student: true,
      timetable: true,
    }))
    .route({
      method: 'PUT',
      path: '/management/attendances/{attendanceId}',
      tags: ['Attendance Management'],
      summary: 'Update attendance record',
      description: 'Updates an existing attendance record',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await attendanceService.updateAttendance(input.attendanceId, input.data, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update attendance record')
      }
    }),

  deleteAttendance: protectedProcedure
    .input(
      z.object({
        attendanceId: z.uuid().describe('Attendance ID'),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .route({
      method: 'DELETE',
      path: '/management/attendances/{attendanceId}',
      tags: ['Attendance Management'],
      summary: 'Delete attendance record',
      description: 'Deletes an attendance record (soft delete)',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = context.user?.id
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await attendanceService.deleteAttendance(input.attendanceId, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete attendance record')
      }
    }),

  // Attendance Summaries and Reports
  getSessionAttendanceSummary: protectedProcedure
    .input(
      z.object({
        timetableId: z.uuid().describe('Session Instance ID'),
      })
    )
    .output(AttendanceSummarySchema)
    .route({
      method: 'GET',
      path: '/management/attendances/sessions/{timetableId}/summary',
      tags: ['Attendance Management'],
      summary: 'Get session attendance summary',
      description: 'Retrieves attendance summary for a specific session',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getSessionAttendanceSummary(input.timetableId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch session attendance summary')
      }
    }),

  getStudentAttendanceSummary: protectedProcedure
    .input(
      z.object({
        studentId: z.string().describe('Student ID'),
        startDate: z.date().optional().describe('Start date for attendance summary'),
        endDate: z.date().optional().describe('End date for attendance summary'),
      })
    )
    .output(StudentAttendanceSummarySchema)
    .route({
      method: 'GET',
      path: '/management/attendances/students/{studentId}/summary',
      tags: ['Attendance Management'],
      summary: 'Get student attendance summary',
      description: 'Retrieves attendance summary for a specific student',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getStudentAttendanceSummary(
          input.studentId,
          orgId,
          input.startDate,
          input.endDate
        )
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch student attendance summary')
      }
    }),
}
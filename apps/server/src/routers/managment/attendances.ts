import { z } from 'zod'
import { db } from '../../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../../lib/errors/orpc-errors'
import { protectedProcedure } from '../../lib/orpc'
import { createAttendanceManagementService } from '../../services/managment/attendances'
import {
  AttendanceListItemSchema,
  AttendanceQuerySchema,
  AttendanceSchema,
  AttendanceSessionListItemSchema,
  AttendanceSessionSchema,
  AttendanceSummarySchema,
  CreateAttendanceInputSchema,
  CreateBulkAttendanceInputSchema,
  StudentAttendanceSummarySchema,
  StudentBasicInfoSchema,
  UpdateAttendanceInputSchema
} from '../../types/attendance'

const attendanceService = createAttendanceManagementService(db)

export const attendanceManagementRouter = {
  // Get students for a timetable
  getStudentsByTimetable: protectedProcedure
    .input(
      z.object({
        timetableId: z.uuid().describe('Timetable ID'),
      })
    )
    .output(z.array(StudentBasicInfoSchema))
    .route({
      method: 'GET',
      path: '/management/attendances/timetables/{timetableId}/students',
      tags: ['Attendance Management'],
      summary: 'Get students for timetable',
      description: 'Retrieves all students enrolled in a timetable\'s classroom or classroom group',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getStudentsByTimetable(input.timetableId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch students for timetable')
      }
    }),

  // Attendance Sessions
  getAttendancesList: protectedProcedure
    .input(AttendanceQuerySchema.optional())
    .output(z.array(AttendanceSessionListItemSchema))
    .route({
      method: 'GET',
      path: '/management/attendances',
      tags: ['Attendance Management'],
      summary: 'List attendance sessions',
      description: 'Retrieves all attendance sessions grouped by timetable with optional filtering',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getAttendancesList(orgId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch attendance sessions')
      }
    }),

  getAttendanceSessionById: protectedProcedure
    .input(
      z.object({
        sessionId: z.uuid().describe('Attendance Session ID'),
      })
    )
    .output(AttendanceSessionSchema)
    .route({
      method: 'GET',
      path: '/management/attendances/sessions/{sessionId}',
      tags: ['Attendance Management'],
      summary: 'Get attendance session',
      description: 'Retrieves a complete attendance session with all student records',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await attendanceService.getAttendanceSessionById(input.sessionId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch attendance session')
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
      const userId = getCurrentUserId(context)
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
      sessionId: z.uuid(),
      created: z.number(),
      updated: z.number(),
      total: z.number(),
    }))
    .route({
      method: 'POST',
      path: '/management/attendances/bulk',
      tags: ['Attendance Management'],
      summary: 'Create or update bulk attendance session',
      description: 'Creates or updates an attendance session with multiple attendance records',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      if (!userId) {
        throw OrpcErrorHelper.unauthorized('User ID is required')
      }
      try {
        return await attendanceService.createBulkAttendance(input, orgId, userId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create/update attendance session')
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
      const userId = getCurrentUserId(context)
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
      const userId = getCurrentUserId(context)
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
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupByOrganizationId } from '../../../tests/helpers/cleanup'
import { seedDatabase, type SeedData } from '../../../tests/helpers/init'
import app from '../../app'
import {
  SuccessResponseSchema,
  TeacherAssignmentSchema,
} from '../../types/user'

describe('/management/teachers/ API Tests', () => {
  let testData: SeedData

  beforeAll(async () => {
    // Init db with mocked data using init helper - creates new random organization
    testData = await seedDatabase()
  })

  afterAll(async () => {
    // Clean up the database data for this test organization
    if (testData.organization?.id) {
      await cleanupByOrganizationId(testData.organization.id)
    }
  })

  describe('createTeacherAssignment', () => {
    it('should create teacher assignment successfully', async () => {
      const { adminCookie } = testData
      const teacherUser = testData.users.find((u) => u.userType === 'teacher')

      if (!teacherUser) {
        throw new Error('Teacher user not found in test data')
      }

      const assignmentData = {
        teacherId: teacherUser.id,
        educationSubjectId: testData?.educationSubjects?.[0]?.id,
        educationLevelId: testData?.educationLevels?.[0]?.id,
      }

      const res = await request(app)
        .post('/api/management/teacher-assignments')
        .send(assignmentData)
        .set('Cookie', adminCookie)

      expect(res.status).toBe(200)

      // Validate response structure
      const validationResult = TeacherAssignmentSchema.safeParse(res.body)
      if (!validationResult.success) {
        console.error('Teacher assignment validation errors:', validationResult.error.issues)
      }
      expect(validationResult.success).toBe(true)

      expect(res.body.teacherId).toBe(assignmentData.teacherId)
      expect(res.body.educationSubjectId).toBe(assignmentData.educationSubjectId)
      expect(res.body.educationLevelId).toBe(assignmentData.educationLevelId)
      expect(res.body.id).toBeDefined()
      expect(res.body.createdAt).toBeDefined()
    })

    it('should reject creation with invalid UUID format', async () => {
      const { adminCookie } = testData
      const teacherUser = testData.users.find((u) => u.userType === 'teacher')

      const assignmentData = {
        teacherId: teacherUser!.id,
        educationSubjectId: 'invalid-uuid',
        educationLevelId: 'invalid-uuid',
      }

      const res = await request(app)
        .post('/api/management/teacher-assignments')
        .send(assignmentData)
        .set('Cookie', adminCookie)

      expect(res.status).toBe(400)
    })

    it('should reject creation with non-existent teacher', async () => {
      const { adminCookie } = testData

      const assignmentData = {
        teacherId: 'non-existent-teacher-id',
        educationSubjectId: testData?.educationSubjects?.[0]?.id,
        educationLevelId: testData?.educationLevels?.[0]?.id,
      }

      const res = await request(app)
        .post('/api/management/teacher-assignments')
        .send(assignmentData)
        .set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('updateTeacherAssignment', () => {
    it('should update teacher assignment successfully', async () => {
      const { adminCookie } = testData
      const teacherUser = testData.users.find((u) => u.userType === 'teacher')

      // First create an assignment
      const createRes = await request(app)
        .post('/api/management/teacher-assignments')
        .send({
          teacherId: teacherUser!.id,
          educationSubjectId: testData?.educationSubjects?.[0]?.id,
          educationLevelId: testData?.educationLevels?.[0]?.id,
        })
        .set('Cookie', adminCookie)

      expect(createRes.status).toBe(200)
      const assignmentId = createRes.body.id

      // Then update it
      const updateData = {
        educationSubjectId: testData?.educationSubjects?.[1]?.id || testData?.educationSubjects?.[0]?.id,
        educationLevelId: testData?.educationLevels?.[1]?.id || testData?.educationLevels?.[0]?.id,
      }

      const updateRes = await request(app)
        .put(`/api/management/teacher-assignments/${assignmentId}`)
        .send(updateData)
        .set('Cookie', adminCookie)

      expect(updateRes.status).toBe(200)

      // Validate response structure
      const validationResult = TeacherAssignmentSchema.safeParse(updateRes.body)
      expect(validationResult.success).toBe(true)

      expect(updateRes.body.educationSubjectId).toBe(updateData.educationSubjectId)
      expect(updateRes.body.educationLevelId).toBe(updateData.educationLevelId)
      expect(updateRes.body.updatedAt).toBeDefined()
    })

    it('should return 404 for non-existent assignment', async () => {
      const { adminCookie } = testData

      const res = await request(app)
        .put('/api/management/teacher-assignments/550e8400-e29b-41d4-a716-446655440000')
        .send({
          educationSubjectId: testData?.educationSubjects?.[0]?.id,
        })
        .set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('deleteTeacherAssignment', () => {
    it('should soft delete teacher assignment successfully', async () => {
      const { adminCookie } = testData
      const teacherUser = testData.users.find((u) => u.userType === 'teacher')

      // First create an assignment
      const createRes = await request(app)
        .post('/api/management/teacher-assignments')
        .send({
          teacherId: teacherUser!.id,
          educationSubjectId: testData?.educationSubjects?.[0]?.id,
          educationLevelId: testData?.educationLevels?.[0]?.id,
        })
        .set('Cookie', adminCookie)

      expect(createRes.status).toBe(200)
      const assignmentId = createRes.body.id

      // Then delete it
      const deleteRes = await request(app)
        .delete(`/api/management/teacher-assignments/${assignmentId}`)
        .set('Cookie', adminCookie)

      expect(deleteRes.status).toBe(200)

      // Validate response structure
      const validationResult = SuccessResponseSchema.safeParse(deleteRes.body)
      expect(validationResult.success).toBe(true)
      expect(deleteRes.body.success).toBe(true)
    })

    it('should return 404 for non-existent assignment', async () => {
      const { adminCookie } = testData

      const res = await request(app)
        .delete('/api/management/teacher-assignments/550e8400-e29b-41d4-a716-446655440000')
        .set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('Authentication and Authorization', () => {
    it('should require authentication for teacher assignment endpoints', async () => {
      const teacherUser = testData.users.find((u) => u.userType === 'teacher')

      // Test teacher assignment endpoints without authentication
      const assignmentData = {
        teacherId: teacherUser!.id,
        educationSubjectId: testData?.educationSubjects?.[0]?.id,
        educationLevelId: testData?.educationLevels?.[0]?.id,
      }

      // Create assignment
      const createRes = await request(app).post('/api/management/teacher-assignments').send(assignmentData)
      expect(createRes.status).toBe(401)

      // Update assignment
      const updateRes = await request(app).put('/api/management/teacher-assignments/some-id').send({
        educationSubjectId: testData?.educationSubjects?.[0]?.id,
      })
      expect(updateRes.status).toBe(401)

      // Delete assignment
      const deleteRes = await request(app).delete('/api/management/teacher-assignments/some-id')
      expect(deleteRes.status).toBe(401)

      // Get teachers list
      const listRes = await request(app).get('/api/management/teachers/list')
      expect(listRes.status).toBe(401)
    })
  })
})
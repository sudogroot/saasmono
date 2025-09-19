import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupByOrganizationId } from '../../../tests/helpers/cleanup'
import { seedDatabase, type SeedData } from '../../../tests/helpers/init'
import app from '../../app'
import {
  ParentStudentRelationSchema,
  SuccessResponseSchema,
  TeacherAssignmentSchema,
  UserListItemSchema,
  UserResponseSchema,
  type UserType,
} from '../../types/user'

describe('/management/user/ API Tests', () => {
  let testData: SeedData

  beforeAll(async () => {
    // Init db with mocked data using init helper - creates new random organization
    testData = await seedDatabase()
  })

  describe('getUserById', () => {
    it('should return user by id with all required fields', async () => {
      const { adminCookie } = testData
      const user = testData.users[0]
      const res = await request(app).get(`/api/management/users/${user.id}`).set('Cookie', adminCookie)

      expect(res.status).toBe(200)

      // Validate response structure using Zod schema
      const validationResult = UserResponseSchema.safeParse(res.body)
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.issues)
      }
      expect(validationResult.success).toBe(true)

      // Validate specific fields
      expect(res.body.id).toBe(user.id)
      expect(res.body.name).toBe(user.name)
      expect(res.body.lastName).toBe(user.lastName)
      expect(res.body.email).toBe(user.email)
      expect(res.body.userType).toBe(user.userType)
      expect(res.body.createdAt).toBeDefined()
      expect(res.body.updatedAt).toBeDefined()
      expect(Array.isArray(res.body.parentChildrenRelations)).toBe(true)
      expect(Array.isArray(res.body.teacherAssignments)).toBe(true)
    })

    it('should return 404 for non-existent user', async () => {
      const { adminCookie } = testData
      const res = await request(app).get('/api/management/users/non-existent-id').set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const user = testData.users[0]
      const res = await request(app).get(`/api/management/users/${user.id}`)

      expect(res.status).toBe(401)
    })
  })

  describe('listUsers', () => {
    it('should return list of all users with proper schema validation', async () => {
      const { adminCookie } = testData
      const res = await request(app).get('/api/management/users').set('Cookie', adminCookie)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThan(0)

      // Validate each user in the response
      res.body.forEach((user: any) => {
        const validationResult = UserListItemSchema.safeParse(user)
        if (!validationResult.success) {
          console.error('User validation errors:', validationResult.error.issues)
        }
        expect(validationResult.success).toBe(true)

        // Ensure all required fields are present
        expect(user.id).toBeDefined()
        expect(user.name).toBeDefined()
        expect(user.lastName).toBeDefined()
        expect(user.email).toBeDefined()
        expect(user.userType).toBeDefined()
        expect(user.createdAt).toBeDefined()
        expect(user.updatedAt).toBeDefined()
      })
    })

    it('should filter users by type when specified', async () => {
      const { adminCookie } = testData
      const userTypes: UserType[] = ['student', 'teacher', 'parent', 'staff']

      for (const userType of userTypes) {
        const res = await request(app).get('/api/management/users').query({ userType }).set('Cookie', adminCookie)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)

        // All returned users should have the specified type
        res.body.forEach((user: any) => {
          expect(user.userType).toBe(userType)
        })
      }
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/management/users')

      expect(res.status).toBe(401)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully with valid data', async () => {
      const { adminCookie } = testData
      const user = testData.users[0]
      const updateData = {
        name: 'Updated Name',
        lastName: 'Updated LastName',
        email: 'updated@example.com',
        userType: 'teacher' as UserType,
      }

      const res = await request(app).put(`/api/management/users/${user.id}`).send(updateData).set('Cookie', adminCookie)

      expect(res.status).toBe(200)

      // Verify the update was applied
      const getRes = await request(app).get(`/api/management/users/${user.id}`).set('Cookie', adminCookie)

      expect(getRes.status).toBe(200)
      expect(getRes.body.name).toBe(updateData.name)
      expect(getRes.body.lastName).toBe(updateData.lastName)
      expect(getRes.body.email).toBe(updateData.email)
      expect(getRes.body.userType).toBe(updateData.userType)
    })

    it('should reject invalid email format', async () => {
      const { adminCookie } = testData
      const user = testData.users[0]

      const res = await request(app)
        .put(`/api/management/users/${user.id}`)
        .send({ email: 'invalid-email' })
        .set('Cookie', adminCookie)

      expect(res.status).toBe(400)
    })

    it('should reject invalid user type', async () => {
      const { adminCookie } = testData
      const user = testData.users[0]

      const res = await request(app)
        .put(`/api/management/users/${user.id}`)
        .send({ userType: 'invalid-type' })
        .set('Cookie', adminCookie)

      expect(res.status).toBe(400)
    })

    it('should return 404 for non-existent user', async () => {
      const { adminCookie } = testData

      const res = await request(app)
        .put('/api/management/users/non-existent-id')
        .send({ name: 'Test' })
        .set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('createParentStudentRelation', () => {
    it('should create parent-student relation successfully', async () => {
      const { adminCookie } = testData
      const parentUser = testData.users.find((u) => u.userType === 'parent')
      const studentUser = testData.users.find((u) => u.userType === 'student')

      if (!parentUser || !studentUser) {
        throw new Error('Required user types not found in test data')
      }

      const relationData = {
        parentId: parentUser.id,
        studentId: studentUser.id,
        relationshipType: 'parent',
      }

      const res = await request(app)
        .post('/api/management/parent-student-relations')
        .send(relationData)
        .set('Cookie', adminCookie)

      expect(res.status).toBe(200)

      // Validate response structure
      const validationResult = ParentStudentRelationSchema.safeParse(res.body)
      if (!validationResult.success) {
        console.error('Parent-student relation validation errors:', validationResult.error.issues)
      }
      expect(validationResult.success).toBe(true)

      expect(res.body.parentId).toBe(relationData.parentId)
      expect(res.body.studentId).toBe(relationData.studentId)
      expect(res.body.relationshipType).toBe(relationData.relationshipType)
      expect(res.body.id).toBeDefined()
      expect(res.body.createdAt).toBeDefined()
    })

    it('should reject creation with non-existent parent', async () => {
      const { adminCookie } = testData
      const studentUser = testData.users.find((u) => u.userType === 'student')

      const relationData = {
        parentId: 'non-existent-parent-id',
        studentId: studentUser!.id,
        relationshipType: 'parent',
      }

      const res = await request(app)
        .post('/api/management/parent-student-relations')
        .send(relationData)
        .set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })

    it('should reject creation with invalid data', async () => {
      const { adminCookie } = testData

      const invalidData = {
        parentId: '',
        studentId: '',
        relationshipType: 'parent',
      }

      const res = await request(app)
        .post('/api/management/parent-student-relations')
        .send(invalidData)
        .set('Cookie', adminCookie)

      expect(res.status).toBe(400)
    })
  })

  describe('deleteParentStudentRelation', () => {
    it('should delete parent-student relation successfully', async () => {
      const { adminCookie } = testData
      const parentUser = testData.users.find((u) => u.userType === 'parent')
      const studentUser = testData.users.find((u) => u.userType === 'student')

      // First create a relation
      const createRes = await request(app)
        .post('/api/management/parent-student-relations')
        .send({
          parentId: parentUser!.id,
          studentId: studentUser!.id,
          relationshipType: 'parent',
        })
        .set('Cookie', adminCookie)

      expect(createRes.status).toBe(200)
      const relationId = createRes.body.id

      // Then delete it
      const deleteRes = await request(app)
        .delete(`/api/management/parent-student-relations/${relationId}`)
        .set('Cookie', adminCookie)

      expect(deleteRes.status).toBe(200)

      // Validate response structure
      const validationResult = SuccessResponseSchema.safeParse(deleteRes.body)
      expect(validationResult.success).toBe(true)
      expect(deleteRes.body.success).toBe(true)
    })

    it('should return 404 for non-existent relation', async () => {
      const { adminCookie } = testData

      const res = await request(app)
        .delete('/api/management/parent-student-relations/550e8400-e29b-41d4-a716-446655440000')
        .set('Cookie', adminCookie)

      expect(res.status).toBe(404)
    })
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
        educationSubjectId: testData.educationSubjects[0].id,
        educationLevelId: testData.educationLevels[0].id,
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
        educationSubjectId: testData.educationSubjects[0].id,
        educationLevelId: testData.educationLevels[0].id,
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
          educationSubjectId: testData.educationSubjects[0].id,
          educationLevelId: testData.educationLevels[0].id,
        })
        .set('Cookie', adminCookie)

      expect(createRes.status).toBe(200)
      const assignmentId = createRes.body.id

      // Then update it
      const updateData = {
        educationSubjectId: testData.educationSubjects[1]?.id || testData.educationSubjects[0].id,
        educationLevelId: testData.educationLevels[1]?.id || testData.educationLevels[0].id,
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
          educationSubjectId: testData.educationSubjects[0].id,
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
          educationSubjectId: testData.educationSubjects[0].id,
          educationLevelId: testData.educationLevels[0].id,
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
    it('should require authentication for all endpoints', async () => {
      const user = testData.users[0]

      // Test all endpoints without authentication
      const endpoints = [
        { method: 'get', path: `/api/management/users/${user.id}` },
        { method: 'get', path: '/api/management/users' },
        { method: 'put', path: `/api/management/users/${user.id}`, body: { name: 'Test' } },
        {
          method: 'post',
          path: '/api/management/parent-student-relations',
          body: { parentId: user.id, studentId: user.id },
        },
        { method: 'delete', path: '/api/management/parent-student-relations/550e8400-e29b-41d4-a716-446655440000' },
        {
          method: 'post',
          path: '/api/management/teacher-assignments',
          body: {
            teacherId: user.id,
            educationSubjectId: testData.educationSubjects[0].id,
            educationLevelId: testData.educationLevels[0].id,
          },
        },
        {
          method: 'put',
          path: '/api/management/teacher-assignments/550e8400-e29b-41d4-a716-446655440000',
          body: { educationSubjectId: testData.educationSubjects[0].id },
        },
        { method: 'delete', path: '/api/management/teacher-assignments/550e8400-e29b-41d4-a716-446655440000' },
      ]

      for (const endpoint of endpoints) {
        let req = request(app)[endpoint.method as 'get' | 'post' | 'put' | 'delete'](endpoint.path)

        if (endpoint.body) {
          req = req.send(endpoint.body)
        }

        const res = await req
        expect(res.status).toBe(401)
      }
    })
  })

  afterAll(async () => {
    // Clean only the initialized data by organization id using generic helper
    try {
      await cleanupByOrganizationId(testData.organization.id)
    } catch (error) {
      console.error('Cleanup failed:', error)
      // Continue with test completion even if cleanup fails
    }
  })
})

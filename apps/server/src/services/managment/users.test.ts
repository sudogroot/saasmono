import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupByOrganizationId } from '../../../tests/helpers/cleanup'
import { seedDatabase, type SeedData } from '../../../tests/helpers/init'
import { testDb } from '../../../tests/setup'
import * as authSchema from '../../db/schema/auth'
import { UserManagementService } from './users'

describe('UserManagementService', () => {
  let userService: UserManagementService
  let testData: SeedData

  beforeAll(async () => {
    // Instantiate service with testDB
    userService = new UserManagementService(testDb)

    // Init db with mocked data using init helper - creates new random organization
    testData = await seedDatabase()
  })

  describe('updateUser', () => {
    it('should update user when user belongs to organization', async () => {
      // Get user from initialized data
      const testUser = testData.users[0] // Get first user
      const userId = testUser.id
      const orgId = testData.organization.id

      // Prepare update data
      const updateData = {
        name: 'Updated Name',
        lastName: 'Updated LastName',
      }

      // Call update user method of UserManagementService
      const updatedUser = await userService.updateUser(userId, orgId, updateData)

      // Get the user information by querying the db
      const userInDb = await testDb.select().from(authSchema.user).where(eq(authSchema.user.id, userId))

      // Assert the changes are reflected in the db
      expect(userInDb).toHaveLength(1)
      expect(userInDb[0].name).toBe('Updated Name')
      expect(userInDb[0].lastName).toBe('Updated LastName')
      expect(updatedUser.name).toBe('Updated Name')
      expect(updatedUser.lastName).toBe('Updated LastName')
    })
  })

  afterAll(async () => {
    // Clean only the initialized data by organization id using generic helper
    await cleanupByOrganizationId(testData.organization.id)
  })
})

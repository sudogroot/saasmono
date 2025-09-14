
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { testDb } from '../../../tests/setup';
import { seedDatabase, type SeedData } from '../../../tests/helpers/init';
import { cleanupByOrganizationId } from '../../../tests/helpers/cleanup';

describe('/management/user/ API Tests', () => {

  let testData: SeedData;

  beforeAll(async () => {
    // Init db with mocked data using init helper - creates new random organization
    testData = await seedDatabase();
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const { adminCookie } = testData;
      const user = testData.users[0];
      const res = await request(app).get(`/api/management/users/${user.id}`).set('Cookie', adminCookie);
      console.log(res.body)
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
    });
  });

  afterAll(async () => {
      // Clean only the initialized data by organization id using generic helper
      await cleanupByOrganizationId(testData.organization.id);
    });
});

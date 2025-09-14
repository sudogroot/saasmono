import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserManagementService, UserUpdateData, CreateParentStudentRelationData, CreateTeacherAssignmentData } from './users';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Mock database instance
const createMockDb = (): NodePgDatabase => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    as: vi.fn().mockReturnThis(),
  };

  return mockQuery as any;
};

describe('UserManagementService', () => {
  let mockDb: NodePgDatabase;
  let userService: UserManagementService;

  beforeEach(() => {
    mockDb = createMockDb();
    userService = new UserManagementService(mockDb);
  });

  describe('updateUser', () => {
    it('should update user when user belongs to organization', async () => {
      const userId = 'user_123';
      const orgId = 'org_456';
      const updateData: UserUpdateData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      // Mock user membership check
      mockDb.select().from.where.mockResolvedValueOnce([{ id: 'member_1' }]);

      // Mock update result
      const updatedUser = { id: userId, ...updateData, updatedAt: new Date() };
      mockDb.update().set().where().returning.mockResolvedValueOnce([updatedUser]);

      const result = await userService.updateUser(userId, orgId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw error when user not found in organization', async () => {
      const userId = 'user_123';
      const orgId = 'org_456';
      const updateData: UserUpdateData = { name: 'John' };

      // Mock empty membership check
      mockDb.select().from.where.mockResolvedValueOnce([]);

      await expect(userService.updateUser(userId, orgId, updateData))
        .rejects.toThrow('User not found in organization');
    });
  });

  describe('getUserById', () => {
    it('should return user with relationships and assignments when user exists in organization', async () => {
      const userId = 'user_123';
      const orgId = 'org_456';
      const mockUser = {
        id: userId,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        userType: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockRelations = [{
        id: 'relation_1',
        parentId: 'parent_123',
        studentId: userId,
        relationshipType: 'parent',
        parentName: 'Jane',
        parentLastName: 'Doe',
        studentName: 'John',
        studentLastName: 'Doe',
        createdAt: new Date()
      }];

      const mockAssignments = [{
        id: 'assignment_1',
        teacherId: userId,
        educationSubjectId: 'subject_456',
        educationLevelId: 'level_789',
        orgId,
        createdAt: new Date()
      }];

      // Mock user data query
      mockDb.select().from().innerJoin().where.mockResolvedValueOnce([mockUser]);

      // Mock parent-children relations query
      mockDb.select().from().innerJoin().innerJoin().innerJoin().innerJoin().where.mockResolvedValueOnce(mockRelations);

      // Mock teacher assignments query
      mockDb.select().from().where().orderBy.mockResolvedValueOnce(mockAssignments);

      const result = await userService.getUserById(userId, orgId);

      expect(result).toEqual({
        ...mockUser,
        parentChildrenRelations: mockRelations,
        teacherAssignments: mockAssignments
      });
      expect(mockDb.select).toHaveBeenCalledTimes(3); // user, relations, assignments
    });

    it('should return user with empty arrays when no relationships or assignments exist', async () => {
      const userId = 'user_123';
      const orgId = 'org_456';
      const mockUser = {
        id: userId,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        userType: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock user data query
      mockDb.select().from().innerJoin().where.mockResolvedValueOnce([mockUser]);

      // Mock empty relations and assignments
      mockDb.select().from().innerJoin().innerJoin().innerJoin().innerJoin().where.mockResolvedValueOnce([]);
      mockDb.select().from().where().orderBy.mockResolvedValueOnce([]);

      const result = await userService.getUserById(userId, orgId);

      expect(result).toEqual({
        ...mockUser,
        parentChildrenRelations: [],
        teacherAssignments: []
      });
    });

    it('should throw error when user not found in organization', async () => {
      const userId = 'user_123';
      const orgId = 'org_456';

      mockDb.select().from().innerJoin().where.mockResolvedValueOnce([]);

      await expect(userService.getUserById(userId, orgId))
        .rejects.toThrow('User not found in organization');
    });
  });

  describe('listUsersByType', () => {
    it('should return all users in organization when no type filter', async () => {
      const orgId = 'org_456';
      const mockUsers = [
        {
          id: 'user_1',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          userType: 'student',
          role: 'member',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user_2',
          name: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          userType: 'teacher',
          role: 'member',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDb.select().from().innerJoin().where().orderBy.mockResolvedValueOnce(mockUsers);

      const result = await userService.listUsersByType(orgId);

      expect(result).toEqual(mockUsers);
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('should return filtered users when type is specified', async () => {
      const orgId = 'org_456';
      const userType = 'teacher';
      const mockTeachers = [
        {
          id: 'user_2',
          name: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          userType: 'teacher',
          role: 'member',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDb.select().from().innerJoin().where().orderBy.mockResolvedValueOnce(mockTeachers);

      const result = await userService.listUsersByType(orgId, userType);

      expect(result).toEqual(mockTeachers);
    });
  });

  describe('createParentStudentRelation', () => {
    it('should create parent-student relation when both users exist in organization', async () => {
      const orgId = 'org_456';
      const relationData: CreateParentStudentRelationData = {
        parentId: 'parent_123',
        studentId: 'student_456',
        relationshipType: 'parent'
      };

      // Mock parent and student membership checks
      mockDb.select().from.where
        .mockResolvedValueOnce([{ id: 'member_1' }]) // parent
        .mockResolvedValueOnce([{ id: 'member_2' }]); // student

      const mockRelation = {
        id: 'relation_789',
        ...relationData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDb.insert().values().returning.mockResolvedValueOnce([mockRelation]);

      const result = await userService.createParentStudentRelation(orgId, relationData);

      expect(result).toEqual(mockRelation);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        parentId: relationData.parentId,
        studentId: relationData.studentId,
        relationshipType: 'parent'
      }));
    });

    it('should throw error when parent not found in organization', async () => {
      const orgId = 'org_456';
      const relationData: CreateParentStudentRelationData = {
        parentId: 'parent_123',
        studentId: 'student_456'
      };

      // Mock empty parent membership check
      mockDb.select().from.where
        .mockResolvedValueOnce([]) // parent not found
        .mockResolvedValueOnce([{ id: 'member_2' }]); // student found

      await expect(userService.createParentStudentRelation(orgId, relationData))
        .rejects.toThrow('Parent not found in organization');
    });

    it('should throw error when student not found in organization', async () => {
      const orgId = 'org_456';
      const relationData: CreateParentStudentRelationData = {
        parentId: 'parent_123',
        studentId: 'student_456'
      };

      // Mock parent found, student not found
      mockDb.select().from.where
        .mockResolvedValueOnce([{ id: 'member_1' }]) // parent found
        .mockResolvedValueOnce([]); // student not found

      await expect(userService.createParentStudentRelation(orgId, relationData))
        .rejects.toThrow('Student not found in organization');
    });
  });

  describe('deleteParentStudentRelation', () => {
    it('should delete relation when it exists and users belong to organization', async () => {
      const orgId = 'org_456';
      const relationId = 'relation_789';

      const mockRelation = [{
        id: relationId,
        parentId: 'parent_123',
        studentId: 'student_456'
      }];

      // Mock relation exists
      mockDb.select().from.where.mockResolvedValueOnce(mockRelation);

      // Mock parent and student membership checks
      mockDb.select().from.where
        .mockResolvedValueOnce([{ id: 'member_1' }]) // parent
        .mockResolvedValueOnce([{ id: 'member_2' }]); // student

      mockDb.delete().where.mockResolvedValueOnce(undefined);

      const result = await userService.deleteParentStudentRelation(orgId, relationId);

      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw error when relation not found', async () => {
      const orgId = 'org_456';
      const relationId = 'relation_789';

      // Mock relation not found
      mockDb.select().from.where.mockResolvedValueOnce([]);

      await expect(userService.deleteParentStudentRelation(orgId, relationId))
        .rejects.toThrow('Parent-student relation not found');
    });
  });

  describe('createTeacherAssignment', () => {
    it('should create teacher assignment when teacher exists in organization', async () => {
      const orgId = 'org_456';
      const assignmentData: CreateTeacherAssignmentData = {
        teacherId: 'teacher_123',
        educationSubjectId: 'subject_456',
        educationLevelId: 'level_789',
        createdByUserId: 'admin_999'
      };

      // Mock teacher membership check
      mockDb.select().from.where.mockResolvedValueOnce([{ id: 'member_1' }]);

      const mockAssignment = {
        id: 'assignment_101',
        ...assignmentData,
        orgId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDb.insert().values().returning.mockResolvedValueOnce([mockAssignment]);

      const result = await userService.createTeacherAssignment(orgId, assignmentData);

      expect(result).toEqual(mockAssignment);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw error when teacher not found in organization', async () => {
      const orgId = 'org_456';
      const assignmentData: CreateTeacherAssignmentData = {
        teacherId: 'teacher_123',
        educationSubjectId: 'subject_456',
        educationLevelId: 'level_789'
      };

      // Mock empty teacher membership check
      mockDb.select().from.where.mockResolvedValueOnce([]);

      await expect(userService.createTeacherAssignment(orgId, assignmentData))
        .rejects.toThrow('Teacher not found in organization');
    });
  });

  describe('getTeacherAssignments', () => {
    it('should return all assignments for organization when no teacher specified', async () => {
      const orgId = 'org_456';
      const mockAssignments = [
        {
          id: 'assignment_1',
          teacherId: 'teacher_123',
          educationSubjectId: 'subject_456',
          educationLevelId: 'level_789',
          orgId,
          createdAt: new Date()
        }
      ];

      mockDb.select().from().where().orderBy.mockResolvedValueOnce(mockAssignments);

      const result = await userService.getTeacherAssignments(orgId);

      expect(result).toEqual(mockAssignments);
    });

    it('should return assignments for specific teacher', async () => {
      const orgId = 'org_456';
      const teacherId = 'teacher_123';

      // Mock teacher membership check
      mockDb.select().from.where.mockResolvedValueOnce([{ id: 'member_1' }]);

      const mockAssignments = [
        {
          id: 'assignment_1',
          teacherId,
          educationSubjectId: 'subject_456',
          educationLevelId: 'level_789',
          orgId,
          createdAt: new Date()
        }
      ];

      mockDb.select().from().where().orderBy.mockResolvedValueOnce(mockAssignments);

      const result = await userService.getTeacherAssignments(orgId, teacherId);

      expect(result).toEqual(mockAssignments);
    });

    it('should throw error when specified teacher not found in organization', async () => {
      const orgId = 'org_456';
      const teacherId = 'teacher_123';

      // Mock empty teacher membership check
      mockDb.select().from.where.mockResolvedValueOnce([]);

      await expect(userService.getTeacherAssignments(orgId, teacherId))
        .rejects.toThrow('Teacher not found in organization');
    });
  });

  describe('updateTeacherAssignment', () => {
    it('should update assignment when it exists in organization', async () => {
      const orgId = 'org_456';
      const assignmentId = 'assignment_123';
      const updateData: Partial<CreateTeacherAssignmentData> = {
        educationLevelId: 'new_level_456'
      };

      // Mock assignment exists
      mockDb.select().from.where.mockResolvedValueOnce([{ id: assignmentId }]);

      const updatedAssignment = {
        id: assignmentId,
        ...updateData,
        updatedAt: new Date()
      };

      mockDb.update().set().where().returning.mockResolvedValueOnce([updatedAssignment]);

      const result = await userService.updateTeacherAssignment(orgId, assignmentId, updateData);

      expect(result).toEqual(updatedAssignment);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw error when assignment not found in organization', async () => {
      const orgId = 'org_456';
      const assignmentId = 'assignment_123';
      const updateData: Partial<CreateTeacherAssignmentData> = {
        educationLevelId: 'new_level_456'
      };

      // Mock assignment not found
      mockDb.select().from.where.mockResolvedValueOnce([]);

      await expect(userService.updateTeacherAssignment(orgId, assignmentId, updateData))
        .rejects.toThrow('Assignment not found in organization');
    });
  });

  describe('deleteTeacherAssignment', () => {
    it('should soft delete assignment when it exists in organization', async () => {
      const orgId = 'org_456';
      const assignmentId = 'assignment_123';
      const deletedByUserId = 'admin_999';

      // Mock assignment exists
      mockDb.select().from.where.mockResolvedValueOnce([{ id: assignmentId }]);

      mockDb.update().set().where.mockResolvedValueOnce(undefined);

      const result = await userService.deleteTeacherAssignment(orgId, assignmentId, deletedByUserId);

      expect(result).toEqual({ success: true });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        deletedByUserId,
        deletedAt: expect.any(Date)
      }));
    });

    it('should throw error when assignment not found in organization', async () => {
      const orgId = 'org_456';
      const assignmentId = 'assignment_123';

      // Mock assignment not found
      mockDb.select().from.where.mockResolvedValueOnce([]);

      await expect(userService.deleteTeacherAssignment(orgId, assignmentId))
        .rejects.toThrow('Assignment not found in organization');
    });
  });
});
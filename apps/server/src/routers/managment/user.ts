import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../../lib/orpc";
import { createUserManagementService, UserType } from "../../services/managment/users";
import { db } from "../../db/index";

// Initialize user service
const userService = createUserManagementService(db);

// Zod schemas for validation
const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  userType: z.enum(['teacher', 'student', 'parent', 'staff']).optional(),
});

const CreateParentStudentRelationSchema = z.object({
  parentId: z.string().min(1),
  studentId: z.string().min(1),
  relationshipType: z.string().optional().default('parent'),
});

const CreateTeacherAssignmentSchema = z.object({
  teacherId: z.string().min(1),
  educationSubjectId: z.string().uuid(),
  educationLevelId: z.string().uuid(),
});

const UpdateTeacherAssignmentSchema = z.object({
  educationSubjectId: z.string().uuid().optional(),
  educationLevelId: z.string().uuid().optional(),
});

// Helper to get organization ID from session
function getOrgId(context: any): string {
  const orgId = context.session?.session?.activeOrganizationId;
  if (!orgId) {
    throw new ORPCError("BAD_REQUEST", "No active organization found");
  }
  return orgId;
}

// Helper to get current user ID
function getCurrentUserId(context: any): string {
  const userId = context.session?.user?.id;
  if (!userId) {
    throw new ORPCError("UNAUTHORIZED", "User not found in session");
  }
  return userId;
}

export const userManagementRouter = {
  // Get user by ID with relationships and assignments
  getUserById: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .meta({
      openapi: {
        method: "GET",
        path: "/management/users/{userId}",
        tags: ["User Management"],
        summary: "Get user by ID with relationships and assignments",
        description: "Retrieves a user with their parent-children relationships and teacher assignments",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.getUserById(input.userId, orgId);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to fetch user");
      }
    }),

  // Update user
  updateUser: protectedProcedure
    .input(z.object({
      userId: z.string().min(1),
      data: UserUpdateSchema
    }))
    .meta({
      openapi: {
        method: "PUT",
        path: "/management/users/{userId}",
        tags: ["User Management"],
        summary: "Update user information",
        description: "Updates user's basic information (name, lastName, email, userType)",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.updateUser(input.userId, orgId, input.data);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to update user");
      }
    }),

  // List users by type
  listUsersByType: protectedProcedure
    .input(z.object({
      userType: z.enum(['teacher', 'student', 'parent', 'staff']).optional()
    }))
    .meta({
      openapi: {
        method: "GET",
        path: "/management/users",
        tags: ["User Management"],
        summary: "List users by type",
        description: "Retrieves all users in organization, optionally filtered by user type",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.listUsersByType(orgId, input.userType);
      } catch (error: any) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to fetch users");
      }
    }),

  // Create parent-student relationship
  createParentStudentRelation: protectedProcedure
    .input(CreateParentStudentRelationSchema)
    .meta({
      openapi: {
        method: "POST",
        path: "/management/parent-student-relations",
        tags: ["User Management"],
        summary: "Create parent-student relationship",
        description: "Creates a relationship between a parent and student in the organization",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.createParentStudentRelation(orgId, input);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to create parent-student relationship");
      }
    }),

  // Get parent-student relationships
  getParentStudentRelations: protectedProcedure
    .input(z.object({
      userId: z.string().min(1).optional()
    }))
    .meta({
      openapi: {
        method: "GET",
        path: "/management/parent-student-relations",
        tags: ["User Management"],
        summary: "Get parent-student relationships",
        description: "Retrieves parent-student relationships, optionally filtered by user ID",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.getParentStudentRelations(orgId, input.userId);
      } catch (error: any) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to fetch parent-student relationships");
      }
    }),

  // Delete parent-student relationship
  deleteParentStudentRelation: protectedProcedure
    .input(z.object({
      relationId: z.string().uuid()
    }))
    .meta({
      openapi: {
        method: "DELETE",
        path: "/management/parent-student-relations/{relationId}",
        tags: ["User Management"],
        summary: "Delete parent-student relationship",
        description: "Removes a parent-student relationship",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.deleteParentStudentRelation(orgId, input.relationId);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to delete parent-student relationship");
      }
    }),

  // Create teacher assignment
  createTeacherAssignment: protectedProcedure
    .input(CreateTeacherAssignmentSchema)
    .meta({
      openapi: {
        method: "POST",
        path: "/management/teacher-assignments",
        tags: ["User Management"],
        summary: "Create teacher assignment",
        description: "Assigns a teacher to a specific subject and education level",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);
      const currentUserId = getCurrentUserId(context);

      try {
        return await userService.createTeacherAssignment(orgId, {
          ...input,
          createdByUserId: currentUserId,
        });
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to create teacher assignment");
      }
    }),

  // Get teacher assignments
  getTeacherAssignments: protectedProcedure
    .input(z.object({
      teacherId: z.string().min(1).optional()
    }))
    .meta({
      openapi: {
        method: "GET",
        path: "/management/teacher-assignments",
        tags: ["User Management"],
        summary: "Get teacher assignments",
        description: "Retrieves teacher assignments, optionally filtered by teacher ID",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);

      try {
        return await userService.getTeacherAssignments(orgId, input.teacherId);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to fetch teacher assignments");
      }
    }),

  // Update teacher assignment
  updateTeacherAssignment: protectedProcedure
    .input(z.object({
      assignmentId: z.string().uuid(),
      data: UpdateTeacherAssignmentSchema
    }))
    .meta({
      openapi: {
        method: "PUT",
        path: "/management/teacher-assignments/{assignmentId}",
        tags: ["User Management"],
        summary: "Update teacher assignment",
        description: "Updates a teacher's subject and/or education level assignment",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);
      const currentUserId = getCurrentUserId(context);

      try {
        return await userService.updateTeacherAssignment(orgId, input.assignmentId, {
          ...input.data,
          createdByUserId: currentUserId, // reused as updatedByUserId
        });
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to update teacher assignment");
      }
    }),

  // Delete teacher assignment
  deleteTeacherAssignment: protectedProcedure
    .input(z.object({
      assignmentId: z.string().uuid()
    }))
    .meta({
      openapi: {
        method: "DELETE",
        path: "/management/teacher-assignments/{assignmentId}",
        tags: ["User Management"],
        summary: "Delete teacher assignment",
        description: "Soft deletes a teacher assignment (marks as deleted)",
      },
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context);
      const currentUserId = getCurrentUserId(context);

      try {
        return await userService.deleteTeacherAssignment(orgId, input.assignmentId, currentUserId);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          throw new ORPCError("NOT_FOUND", error.message);
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to delete teacher assignment");
      }
    }),
};
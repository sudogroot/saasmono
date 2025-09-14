import { testDb } from "../setup";
import * as authSchema from "../../src/db/schema/auth";
import * as usersSchema from "../../src/db/schema/users";
import { eq, and } from "drizzle-orm";

/**
 * Generic cleanup helper that deletes all data related to a specific organization ID.
 * This ensures test isolation by cleaning only the test organization's data.
 */
export const cleanupByOrganizationId = async (organizationId: string): Promise<void> => {
  await testDb.transaction(async (tx) => {
    // Delete in proper order to respect foreign key constraints
    // Following the same pattern as reset.ts but filtered by organization

    // 1. Delete teacher assignments for this organization
    await tx
      .delete(usersSchema.teacherEducationSubjectLevelAssignment)
      .where(eq(usersSchema.teacherEducationSubjectLevelAssignment.orgId, organizationId));

    // 2. Delete organization config for this organization
    await tx
      .delete(usersSchema.organizationConfig)
      .where(eq(usersSchema.organizationConfig.orgId, organizationId));

    // 3. Delete parent-student relations for users in this organization
    // First, get all user IDs that belong to this organization
    const organizationMembers = await tx
      .select({ userId: authSchema.member.userId })
      .from(authSchema.member)
      .where(eq(authSchema.member.organizationId, organizationId));

    const userIds = organizationMembers.map(m => m.userId);

    if (userIds.length > 0) {
      // Delete parent-student relations where either parent or student belongs to this org
      for (const userId of userIds) {
        await tx
          .delete(usersSchema.parentStudentRelation)
          .where(
            eq(usersSchema.parentStudentRelation.parentId, userId)
          );

        await tx
          .delete(usersSchema.parentStudentRelation)
          .where(
            eq(usersSchema.parentStudentRelation.studentId, userId)
          );
      }
    }

    // 4. Delete invitations for this organization
    await tx
      .delete(authSchema.invitation)
      .where(eq(authSchema.invitation.organizationId, organizationId));

    // 5. Delete sessions for users in this organization
    if (userIds.length > 0) {
      for (const userId of userIds) {
        await tx
          .delete(authSchema.session)
          .where(eq(authSchema.session.userId, userId));
      }
    }

    // 6. Delete accounts for users in this organization
    if (userIds.length > 0) {
      for (const userId of userIds) {
        await tx
          .delete(authSchema.account)
          .where(eq(authSchema.account.userId, userId));
      }
    }

    // 7. Delete verification records for users in this organization
    if (userIds.length > 0) {
      for (const userId of userIds) {
        await tx
          .delete(authSchema.verification)
          .where(eq(authSchema.verification.identifier, userId));
      }
    }

    // 8. Delete organization members
    await tx
      .delete(authSchema.member)
      .where(eq(authSchema.member.organizationId, organizationId));

    // 9. Delete users that belong to this organization
    if (userIds.length > 0) {
      for (const userId of userIds) {
        await tx
          .delete(authSchema.user)
          .where(eq(authSchema.user.id, userId));
      }
    }

    // 10. Finally, delete the organization itself
    await tx
      .delete(authSchema.organization)
      .where(eq(authSchema.organization.id, organizationId));
  });
};

/**
 * Clean up multiple organizations at once
 */
export const cleanupByOrganizationIds = async (organizationIds: string[]): Promise<void> => {
  for (const orgId of organizationIds) {
    await cleanupByOrganizationId(orgId);
  }
};

/**
 * Verify that all data for an organization has been cleaned up
 * Useful for testing the cleanup helper itself
 */
export const verifyOrganizationCleanup = async (organizationId: string): Promise<boolean> => {
  const checks = await testDb.transaction(async (tx) => {
    // Check if organization still exists
    const org = await tx
      .select()
      .from(authSchema.organization)
      .where(eq(authSchema.organization.id, organizationId));

    // Check if any members still exist
    const members = await tx
      .select()
      .from(authSchema.member)
      .where(eq(authSchema.member.organizationId, organizationId));

    // Check if any invitations still exist
    const invitations = await tx
      .select()
      .from(authSchema.invitation)
      .where(eq(authSchema.invitation.organizationId, organizationId));

    // Check if any org configs still exist
    const configs = await tx
      .select()
      .from(usersSchema.organizationConfig)
      .where(eq(usersSchema.organizationConfig.orgId, organizationId));

    // Check if any teacher assignments still exist
    const assignments = await tx
      .select()
      .from(usersSchema.teacherEducationSubjectLevelAssignment)
      .where(eq(usersSchema.teacherEducationSubjectLevelAssignment.orgId, organizationId));

    return {
      organization: org.length,
      members: members.length,
      invitations: invitations.length,
      configs: configs.length,
      assignments: assignments.length
    };
  });

  // All counts should be 0 for successful cleanup
  return Object.values(checks).every(count => count === 0);
};
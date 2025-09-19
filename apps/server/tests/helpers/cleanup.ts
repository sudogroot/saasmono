import { eq, inArray } from 'drizzle-orm'
import * as authSchema from '../../src/db/schema/auth'
import * as educationSchema from '../../src/db/schema/education'
import * as usersSchema from '../../src/db/schema/users'
import { testDb } from '../setup'

/**
 * Generic cleanup helper that deletes all data related to a specific organization ID.
 * This ensures test isolation by cleaning only the test organization's data.
 */
export const cleanupByOrganizationId = async (organizationId: string): Promise<void> => {
  await testDb.transaction(async (tx) => {
    // Delete in proper order to respect foreign key constraints
    // First get all user IDs that belong to this organization
    const organizationMembers = await tx
      .select({ userId: authSchema.member.userId })
      .from(authSchema.member)
      .where(eq(authSchema.member.organizationId, organizationId))

    const userIds = organizationMembers.map((m) => m.userId)

    // 1. Delete teacher assignments for this organization
    await tx
      .delete(usersSchema.teacherEducationSubjectLevelAssignment)
      .where(eq(usersSchema.teacherEducationSubjectLevelAssignment.orgId, organizationId))

    // 2. Delete education level-subject relationships for this organization
    await tx
      .delete(educationSchema.educationLevelSubject)
      .where(eq(educationSchema.educationLevelSubject.orgId, organizationId))

    // 3. Delete education subjects for this organization
    await tx.delete(educationSchema.educationSubject).where(eq(educationSchema.educationSubject.orgId, organizationId))

    // 4. Delete education levels for this organization
    await tx.delete(educationSchema.educationLevel).where(eq(educationSchema.educationLevel.orgId, organizationId))

    // 5. Delete organization config for this organization
    await tx.delete(usersSchema.organizationConfig).where(eq(usersSchema.organizationConfig.orgId, organizationId))

    // 6. Delete parent-student relations for users in this organization
    if (userIds.length > 0) {
      // Delete parent-student relations where either parent or student belongs to this org
      await tx
        .delete(usersSchema.parentStudentRelation)
        .where(inArray(usersSchema.parentStudentRelation.parentId, userIds))

      await tx
        .delete(usersSchema.parentStudentRelation)
        .where(inArray(usersSchema.parentStudentRelation.studentId, userIds))
    }

    // 7. Delete invitations for this organization
    await tx.delete(authSchema.invitation).where(eq(authSchema.invitation.organizationId, organizationId))

    // 8. Delete sessions for users in this organization
    if (userIds.length > 0) {
      await tx.delete(authSchema.session).where(inArray(authSchema.session.userId, userIds))
    }

    // 9. Delete accounts for users in this organization
    if (userIds.length > 0) {
      await tx.delete(authSchema.account).where(inArray(authSchema.account.userId, userIds))
    }

    // 10. Delete verification records for users in this organization
    if (userIds.length > 0) {
      await tx.delete(authSchema.verification).where(inArray(authSchema.verification.identifier, userIds))
    }

    // 11. Delete organization members
    await tx.delete(authSchema.member).where(eq(authSchema.member.organizationId, organizationId))

    // 12. Delete users that belong to this organization
    if (userIds.length > 0) {
      await tx.delete(authSchema.user).where(inArray(authSchema.user.id, userIds))
    }

    // 13. Finally, delete the organization itself
    await tx.delete(authSchema.organization).where(eq(authSchema.organization.id, organizationId))
  })
}

/**
 * Clean up multiple organizations at once
 */
export const cleanupByOrganizationIds = async (organizationIds: string[]): Promise<void> => {
  for (const orgId of organizationIds) {
    await cleanupByOrganizationId(orgId)
  }
}

/**
 * Verify that all data for an organization has been cleaned up
 * Useful for testing the cleanup helper itself
 */
export const verifyOrganizationCleanup = async (organizationId: string): Promise<boolean> => {
  const checks = await testDb.transaction(async (tx) => {
    // Check if organization still exists
    const org = await tx.select().from(authSchema.organization).where(eq(authSchema.organization.id, organizationId))

    // Check if any members still exist
    const members = await tx
      .select()
      .from(authSchema.member)
      .where(eq(authSchema.member.organizationId, organizationId))

    // Check if any invitations still exist
    const invitations = await tx
      .select()
      .from(authSchema.invitation)
      .where(eq(authSchema.invitation.organizationId, organizationId))

    // Check if any org configs still exist
    const configs = await tx
      .select()
      .from(usersSchema.organizationConfig)
      .where(eq(usersSchema.organizationConfig.orgId, organizationId))

    // Check if any teacher assignments still exist
    const assignments = await tx
      .select()
      .from(usersSchema.teacherEducationSubjectLevelAssignment)
      .where(eq(usersSchema.teacherEducationSubjectLevelAssignment.orgId, organizationId))

    // Check if any education levels still exist
    const educationLevels = await tx
      .select()
      .from(educationSchema.educationLevel)
      .where(eq(educationSchema.educationLevel.orgId, organizationId))

    // Check if any education subjects still exist
    const educationSubjects = await tx
      .select()
      .from(educationSchema.educationSubject)
      .where(eq(educationSchema.educationSubject.orgId, organizationId))

    // Check if any education level-subject relationships still exist
    const levelSubjects = await tx
      .select()
      .from(educationSchema.educationLevelSubject)
      .where(eq(educationSchema.educationLevelSubject.orgId, organizationId))

    return {
      organization: org.length,
      members: members.length,
      invitations: invitations.length,
      configs: configs.length,
      assignments: assignments.length,
      educationLevels: educationLevels.length,
      educationSubjects: educationSubjects.length,
      levelSubjects: levelSubjects.length,
    }
  })

  // All counts should be 0 for successful cleanup
  return Object.values(checks).every((count) => count === 0)
}

/**
 * Complete cleanup of all test data - use this to reset between test suites
 */
export const cleanupAllTestData = async (): Promise<void> => {
  await testDb.transaction(async (tx) => {
    // Delete all test-related data in proper order

    // 1. Delete all teacher assignments
    await tx.delete(usersSchema.teacherEducationSubjectLevelAssignment)

    // 2. Delete all education level-subject relationships
    await tx.delete(educationSchema.educationLevelSubject)

    // 3. Delete all education subjects (only test org ones will be deleted due to orgId constraint)
    await tx.delete(educationSchema.educationSubject)

    // 4. Delete all education levels (only test org ones will be deleted due to orgId constraint)
    await tx.delete(educationSchema.educationLevel)

    // 5. Delete all parent-student relations
    await tx.delete(usersSchema.parentStudentRelation)

    // 6. Delete all organization configs
    await tx.delete(usersSchema.organizationConfig)

    // 7. Delete all invitations
    await tx.delete(authSchema.invitation)

    // 8. Delete all sessions
    await tx.delete(authSchema.session)

    // 9. Delete all verification records
    await tx.delete(authSchema.verification)

    // 10. Delete all accounts
    await tx.delete(authSchema.account)

    // 11. Delete all organization members
    await tx.delete(authSchema.member)

    // 12. Delete all users
    await tx.delete(authSchema.user)

    // 13. Delete all organizations
    await tx.delete(authSchema.organization)

    // Note: Institution levels are preserved as global reference data
  })
}

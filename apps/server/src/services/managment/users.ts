import { and, eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { user, member, organization } from "../../db/schema/auth";
import { parentStudentRelation, teacherEducationSubjectLevelAssignment } from "../../db/schema/users";

export interface UserUpdateData {
  name?: string;
  lastName?: string;
  email?: string;
  userType?: string;
}

export type UserType = 'teacher' | 'student' | 'parent' | 'staff';

export interface CreateParentStudentRelationData {
  parentId: string;
  studentId: string;
  relationshipType?: string;
}

export interface CreateTeacherAssignmentData {
  teacherId: string;
  educationSubjectId: string;
  educationLevelId: string;
  createdByUserId?: string;
}

export class UserManagementService {
  private db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  // 1. Simple CRUD operations for users
  async updateUser(userId: string, orgId: string, updateData: UserUpdateData) {
    // Verify user belongs to organization
    const userMembership = await this.db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, userId),
          eq(member.organizationId, orgId)
        )
      );

    if (userMembership.length === 0) {
      throw new Error('User not found in organization');
    }

    const [updatedUser] = await this.db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser;
  }

  async getUserById(userId: string, orgId: string) {
    const result = await this.db
      .select({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
      .from(user)
      .innerJoin(member, eq(user.id, member.userId))
      .where(
        and(
          eq(user.id, userId),
          eq(member.organizationId, orgId)
        )
      );

    if (result.length === 0) {
      throw new Error('User not found in organization');
    }

    const userData = result[0];

    // Get parent-children relationships (where user is parent OR child)
    const parentChildrenRelations = await this.db
      .select({
        id: parentStudentRelation.id,
        parentId: parentStudentRelation.parentId,
        studentId: parentStudentRelation.studentId,
        relationshipType: parentStudentRelation.relationshipType,
        parentName: sql<string>`parent_user.name`,
        parentLastName: sql<string>`parent_user.last_name`,
        studentName: sql<string>`student_user.name`,
        studentLastName: sql<string>`student_user.last_name`,
        createdAt: parentStudentRelation.createdAt
      })
      .from(parentStudentRelation)
      .innerJoin(user.as('parent_user'), eq(parentStudentRelation.parentId, sql`parent_user.id`))
      .innerJoin(user.as('student_user'), eq(parentStudentRelation.studentId, sql`student_user.id`))
      .innerJoin(member.as('parent_member'), eq(sql`parent_user.id`, sql`parent_member.user_id`))
      .innerJoin(member.as('student_member'), eq(sql`student_user.id`, sql`student_member.user_id`))
      .where(
        and(
          eq(sql`parent_member.organization_id`, orgId),
          eq(sql`student_member.organization_id`, orgId),
          sql`(${parentStudentRelation.parentId} = ${userId} OR ${parentStudentRelation.studentId} = ${userId})`
        )
      );

    // Get teacher assignments (only if user is a teacher)
    const teacherAssignments = await this.db
      .select()
      .from(teacherEducationSubjectLevelAssignment)
      .where(
        and(
          eq(teacherEducationSubjectLevelAssignment.teacherId, userId),
          eq(teacherEducationSubjectLevelAssignment.orgId, orgId)
        )
      )
      .orderBy(teacherEducationSubjectLevelAssignment.createdAt);

    return {
      ...userData,
      parentChildrenRelations: parentChildrenRelations || [],
      teacherAssignments: teacherAssignments || []
    };
  }

  // 2. List users filtered by type
  async listUsersByType(orgId: string, userType?: UserType) {
    const conditions = [eq(member.organizationId, orgId)];

    if (userType) {
      conditions.push(eq(user.userType, userType));
    }

    const users = await this.db
      .select({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
      .from(user)
      .innerJoin(member, eq(user.id, member.userId))
      .where(and(...conditions))
      .orderBy(user.lastName, user.name);

    return users;
  }

  // 3. Parent-Student Relation CRUD
  async createParentStudentRelation(orgId: string, data: CreateParentStudentRelationData) {
    // Verify both parent and student belong to organization
    const [parentMember, studentMember] = await Promise.all([
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, data.parentId),
            eq(member.organizationId, orgId)
          )
        ),
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, data.studentId),
            eq(member.organizationId, orgId)
          )
        )
    ]);

    if (parentMember.length === 0) {
      throw new Error('Parent not found in organization');
    }
    if (studentMember.length === 0) {
      throw new Error('Student not found in organization');
    }

    const [relation] = await this.db
      .insert(parentStudentRelation)
      .values({
        parentId: data.parentId,
        studentId: data.studentId,
        relationshipType: data.relationshipType || 'parent'
      })
      .returning();

    return relation;
  }


  async deleteParentStudentRelation(orgId: string, relationId: string) {
    // Verify the relation exists and both users belong to organization
    const relation = await this.db
      .select({
        id: parentStudentRelation.id,
        parentId: parentStudentRelation.parentId,
        studentId: parentStudentRelation.studentId
      })
      .from(parentStudentRelation)
      .where(eq(parentStudentRelation.id, relationId));

    if (relation.length === 0) {
      throw new Error('Parent-student relation not found');
    }

    const [parentMember, studentMember] = await Promise.all([
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, relation[0].parentId),
            eq(member.organizationId, orgId)
          )
        ),
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, relation[0].studentId),
            eq(member.organizationId, orgId)
          )
        )
    ]);

    if (parentMember.length === 0 || studentMember.length === 0) {
      throw new Error('Users not found in organization');
    }

    await this.db
      .delete(parentStudentRelation)
      .where(eq(parentStudentRelation.id, relationId));

    return { success: true };
  }

  // 4. Teacher Education Subject Level Assignment CRUD
  async createTeacherAssignment(orgId: string, data: CreateTeacherAssignmentData) {
    // Verify teacher belongs to organization
    const teacherMember = await this.db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, data.teacherId),
          eq(member.organizationId, orgId)
        )
      );

    if (teacherMember.length === 0) {
      throw new Error('Teacher not found in organization');
    }

    const [assignment] = await this.db
      .insert(teacherEducationSubjectLevelAssignment)
      .values({
        teacherId: data.teacherId,
        educationSubjectId: data.educationSubjectId,
        educationLevelId: data.educationLevelId,
        orgId: orgId,
        createdByUserId: data.createdByUserId
      })
      .returning();

    return assignment;
  }

  async updateTeacherAssignment(
    orgId: string,
    assignmentId: string,
    data: Partial<CreateTeacherAssignmentData>
  ) {
    // Verify assignment exists in organization
    const existingAssignment = await this.db
      .select()
      .from(teacherEducationSubjectLevelAssignment)
      .where(
        and(
          eq(teacherEducationSubjectLevelAssignment.id, assignmentId),
          eq(teacherEducationSubjectLevelAssignment.orgId, orgId)
        )
      );

    if (existingAssignment.length === 0) {
      throw new Error('Assignment not found in organization');
    }

    const [updatedAssignment] = await this.db
      .update(teacherEducationSubjectLevelAssignment)
      .set({
        ...data,
        updatedByUserId: data.createdByUserId, // reuse for updatedBy
        updatedAt: new Date()
      })
      .where(eq(teacherEducationSubjectLevelAssignment.id, assignmentId))
      .returning();

    return updatedAssignment;
  }

  async deleteTeacherAssignment(orgId: string, assignmentId: string, deletedByUserId?: string) {
    // Verify assignment exists in organization
    const existingAssignment = await this.db
      .select()
      .from(teacherEducationSubjectLevelAssignment)
      .where(
        and(
          eq(teacherEducationSubjectLevelAssignment.id, assignmentId),
          eq(teacherEducationSubjectLevelAssignment.orgId, orgId)
        )
      );

    if (existingAssignment.length === 0) {
      throw new Error('Assignment not found in organization');
    }

    // Soft delete
    await this.db
      .update(teacherEducationSubjectLevelAssignment)
      .set({
        deletedByUserId,
        deletedAt: new Date()
      })
      .where(eq(teacherEducationSubjectLevelAssignment.id, assignmentId));

    return { success: true };
  }
}

// Factory function to create service instance
export function createUserManagementService(db: NodePgDatabase) {
  return new UserManagementService(db);
}

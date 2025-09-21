import { classroom, classroomTeacherAssignment } from '@/db/schema/classroom'
import { educationLevel, educationSubject } from '@/db/schema/education'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member, user } from '../../db/schema/auth'
import { parentStudentRelation, teacherEducationSubjectLevelAssignment } from '../../db/schema/users'
import {
  type ParentStudentRelation,
  type UserListItem,
  type UserResponse,
  type UserType,
  type UserUpdateInput,
} from '../../types/user'

export interface CreateParentStudentRelationData {
  parentId: string
  studentId: string
  relationshipType?: string
}

export interface CreateTeacherAssignmentData {
  teacherId: string
  educationSubjectId: string
  educationLevelId: string
  createdByUserId?: string
}

export class UserManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  // 1. Simple CRUD operations for users
  async updateUser(userId: string, orgId: string, updateData: UserUpdateInput) {
    // Verify user belongs to organization
    const userMembership = await this.db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))

    if (userMembership.length === 0) {
      throw new Error('User not found in organization')
    }

    const [updatedUser] = await this.db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning()

    return updatedUser as UserUpdateInput
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
        updatedAt: user.updatedAt,
      })
      .from(user)
      .innerJoin(member, eq(user.id, member.userId))
      .where(and(eq(user.id, userId), eq(member.organizationId, orgId)))

    if (result.length === 0) {
      throw new Error('User not found in organization')
    }

    const userData = result[0]
    if (!userData) {
      throw new Error('User data not found')
    }

    // Get parent-children relationships (where user is parent OR child)
    const parentChildrenRelations = await this.db
      .select()
      .from(parentStudentRelation)
      .where(sql`(${parentStudentRelation.parentId} = ${userId} OR ${parentStudentRelation.studentId} = ${userId})`)

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
      .orderBy(teacherEducationSubjectLevelAssignment.createdAt)

    return {
      ...userData,
      userType: userData.userType as UserType,
      parentChildrenRelations: parentChildrenRelations || [],
      teacherAssignments: teacherAssignments || [],
    } as unknown as UserResponse
  }

  // 2. List users filtered by type
  async listUsersByType(orgId: string, userType?: UserType) {
    const conditions = [eq(member.organizationId, orgId)]

    if (userType) {
      conditions.push(eq(user.userType, userType))
    }

    const users = await this.db
      .select({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .innerJoin(member, eq(user.id, member.userId))
      .where(and(...conditions))
      .orderBy(user.lastName, user.name)

    return users as UserListItem[]
  }

  // Get teachers with their classroom and subject assignments
  async getTeachersList(orgId: string) {
    const conditions = [eq(member.organizationId, orgId), eq(user.userType, 'teacher')]

    const results = await this.db
      .select({
        teacherId: user.id,
        teacherName: user.name,
        teacherLastName: user.lastName,
        teacherEmail: user.email,
        teacherCreatedAt: user.createdAt,
        teacherUpdatedAt: user.updatedAt,
        assignmentId: classroomTeacherAssignment.id,
        classroomId: classroom.id,
        classroomName: classroom.name,
        classroomCode: classroom.code,
        classroomAcademicYear: classroom.academicYear,
        educationLevelId: educationLevel.id,
        educationLevelLevel: educationLevel.level,
        educationLevelDisplayNameAr: educationLevel.displayNameAr,
        subjectId: educationSubject.id,
        subjectName: educationSubject.name,
        subjectDisplayNameAr: educationSubject.displayNameAr,
        assignmentRole: classroomTeacherAssignment.role,
        isMainTeacher: classroomTeacherAssignment.isMainTeacher,
        assignmentDeletedAt: classroomTeacherAssignment.deletedAt,
        classroomDeletedAt: classroom.deletedAt,
      })
      .from(user)
      .innerJoin(member, eq(user.id, member.userId))
      .leftJoin(classroomTeacherAssignment, eq(user.id, classroomTeacherAssignment.teacherId))
      .leftJoin(classroom, eq(classroom.id, classroomTeacherAssignment.classroomId))
      .leftJoin(educationLevel, eq(classroom.educationLevelId, educationLevel.id))
      .leftJoin(educationSubject, eq(classroomTeacherAssignment.educationSubjectId, educationSubject.id))
      .where(and(...conditions))
      .orderBy(user.lastName, user.name)

    // Group results by teacher
    const teachersMap = new Map()

    results.forEach((row) => {
      const teacherId = row.teacherId

      if (!teachersMap.has(teacherId)) {
        teachersMap.set(teacherId, {
          id: row.teacherId,
          name: row.teacherName,
          lastName: row.teacherLastName,
          email: row.teacherEmail,
          userType: 'teacher' as const,
          createdAt: row.teacherCreatedAt,
          updatedAt: row.teacherUpdatedAt,
          classrooms: [],
        })
      }

      // If there's a classroom assignment and it's not soft deleted, add it
      if (row.classroomId && row.assignmentId && !row.classroomDeletedAt && !row.assignmentDeletedAt) {
        const teacher = teachersMap.get(teacherId)

        // Check if classroom already exists for this teacher
        let classroom = teacher.classrooms.find((c: any) => c.id === row.classroomId)

        if (!classroom) {
          classroom = {
            id: row.classroomId,
            name: row.classroomName,
            code: row.classroomCode,
            academicYear: row.classroomAcademicYear,
            educationLevel: {
              id: row.educationLevelId,
              level: row.educationLevelLevel,
              displayNameAr: row.educationLevelDisplayNameAr,
            },
            subjects: [],
          }
          teacher.classrooms.push(classroom)
        }

        // Add subject if not already present
        if (row.subjectId && !classroom.subjects.find((s: any) => s.id === row.subjectId)) {
          classroom.subjects.push({
            id: row.subjectId,
            name: row.subjectName,
            displayNameAr: row.subjectDisplayNameAr,
            role: row.assignmentRole,
            isMainTeacher: row.isMainTeacher === 'true',
            assignmentId: row.assignmentId,
          })
        }
      }
    })

    return Array.from(teachersMap.values())
  }

  // 3. Parent-Student Relation CRUD
  async createParentStudentRelation(orgId: string, data: CreateParentStudentRelationData) {
    // Verify both parent and student belong to organization and get their details
    const [parentResult, studentResult] = await Promise.all([
      this.db
        .select({
          id: user.id,
          name: user.name,
          lastName: user.lastName,
        })
        .from(user)
        .innerJoin(member, eq(user.id, member.userId))
        .where(and(eq(user.id, data.parentId), eq(member.organizationId, orgId))),
      this.db
        .select({
          id: user.id,
          name: user.name,
          lastName: user.lastName,
        })
        .from(user)
        .innerJoin(member, eq(user.id, member.userId))
        .where(and(eq(user.id, data.studentId), eq(member.organizationId, orgId))),
    ])

    if (parentResult.length === 0) {
      throw new Error('Parent not found in organization')
    }
    if (studentResult.length === 0) {
      throw new Error('Student not found in organization')
    }

    const parent = parentResult[0]
    const student = studentResult[0]
    if (!parent || !student) {
      throw new Error('Parent or student data not found')
    }

    const [relation] = await this.db
      .insert(parentStudentRelation)
      .values({
        parentId: data.parentId,
        studentId: data.studentId,
        relationshipType: data.relationshipType || 'parent',
      })
      .returning()

    if (!relation) {
      throw new Error('Failed to create parent-student relation')
    }

    // Return relation with names included
    return {
      id: relation.id,
      parentId: relation.parentId,
      studentId: relation.studentId,
      relationshipType: relation.relationshipType,
      parentName: parent.name,
      parentLastName: parent.lastName,
      studentName: student.name,
      studentLastName: student.lastName,
      createdAt: relation.createdAt,
    } as unknown as ParentStudentRelation
  }

  async deleteParentStudentRelation(orgId: string, relationId: string) {
    // Verify the relation exists and both users belong to organization
    const relation = await this.db
      .select({
        id: parentStudentRelation.id,
        parentId: parentStudentRelation.parentId,
        studentId: parentStudentRelation.studentId,
      })
      .from(parentStudentRelation)
      .where(eq(parentStudentRelation.id, relationId))

    if (relation.length === 0) {
      throw new Error('Parent-student relation not found')
    }

    const relationData = relation[0]
    if (!relationData) {
      throw new Error('Relation data not found')
    }

    const [parentMember, studentMember] = await Promise.all([
      this.db
        .select()
        .from(member)
        .where(and(eq(member.userId, relationData.parentId), eq(member.organizationId, orgId))),
      this.db
        .select()
        .from(member)
        .where(and(eq(member.userId, relationData.studentId), eq(member.organizationId, orgId))),
    ])

    if (parentMember.length === 0 || studentMember.length === 0) {
      throw new Error('Users not found in organization')
    }

    await this.db.delete(parentStudentRelation).where(eq(parentStudentRelation.id, relationId))

    return { success: true }
  }

  // 4. Teacher Education Subject Level Assignment CRUD
  async createTeacherAssignment(orgId: string, data: CreateTeacherAssignmentData) {
    // Verify teacher belongs to organization
    const teacherMember = await this.db
      .select()
      .from(member)
      .where(and(eq(member.userId, data.teacherId), eq(member.organizationId, orgId)))

    if (teacherMember.length === 0) {
      throw new Error('Teacher not found in organization')
    }

    const result = await this.db
      .insert(teacherEducationSubjectLevelAssignment)
      .values({
        teacherId: data.teacherId,
        educationSubjectId: data.educationSubjectId,
        educationLevelId: data.educationLevelId,
        orgId: orgId,
        createdByUserId: data.createdByUserId,
      })
      .returning()

    if (result.length === 0) {
      throw new Error('Failed to create teacher assignment')
    }

    const assignment = result[0]
    if (!assignment) {
      throw new Error('Failed to create teacher assignment - no result returned')
    }

    return assignment
  }

  async updateTeacherAssignment(orgId: string, assignmentId: string, data: Partial<CreateTeacherAssignmentData>) {
    // Verify assignment exists in organization
    const existingAssignment = await this.db
      .select()
      .from(teacherEducationSubjectLevelAssignment)
      .where(
        and(
          eq(teacherEducationSubjectLevelAssignment.id, assignmentId),
          eq(teacherEducationSubjectLevelAssignment.orgId, orgId)
        )
      )

    if (existingAssignment.length === 0) {
      throw new Error('Assignment not found in organization')
    }

    const result = await this.db
      .update(teacherEducationSubjectLevelAssignment)
      .set({
        ...data,
        updatedByUserId: data.createdByUserId, // reuse for updatedBy
        updatedAt: new Date(),
      })
      .where(eq(teacherEducationSubjectLevelAssignment.id, assignmentId))
      .returning()

    if (result.length === 0) {
      throw new Error('Failed to update teacher assignment')
    }

    const updatedAssignment = result[0]
    if (!updatedAssignment) {
      throw new Error('Failed to update teacher assignment - no result returned')
    }

    return updatedAssignment
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
      )

    if (existingAssignment.length === 0) {
      throw new Error('Assignment not found in organization')
    }

    // Soft delete
    await this.db
      .update(teacherEducationSubjectLevelAssignment)
      .set({
        deletedByUserId,
        deletedAt: new Date(),
      })
      .where(eq(teacherEducationSubjectLevelAssignment.id, assignmentId))

    return { success: true }
  }
}

// Factory function to create service instance
export function createUserManagementService(db: NodePgDatabase) {
  return new UserManagementService(db)
}

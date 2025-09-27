import { classroom, classroomTeacherAssignment } from '@/db/schema/classroom'
import { educationLevel, educationSubject } from '@/db/schema/education'
import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member, user } from '../../db/schema/auth'
import { teacherEducationSubjectLevelAssignment } from '../../db/schema/users'

export interface CreateTeacherAssignmentData {
  teacherId: string
  educationSubjectId: string
  educationLevelId: string
  createdByUserId?: string
}

export class TeacherManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
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

  // Teacher Education Subject Level Assignment CRUD
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
export function createTeacherManagementService(db: NodePgDatabase) {
  return new TeacherManagementService(db)
}
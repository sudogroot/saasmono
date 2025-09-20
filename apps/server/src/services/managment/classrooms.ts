import { classroom, classroomStudentEnrollment, classroomTeacherAssignment } from '@/db/schema/classroom'
import { educationLevel } from '@/db/schema/education'
import type { ClassroomListItem } from '@/types/classroom'
import { and, count, eq, isNull } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export class ClassroomManagementService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async getClassroomsList(orgId: string) {
    const results = await this.db
      .select({
        classroomId: classroom.id,
        classroomName: classroom.name,
        classroomAcademicYear: classroom.academicYear,
        classroomEducationLevelId: classroom.educationLevelId,
        levelId: educationLevel.id,
        levelLevel: educationLevel.level,
        levelSection: educationLevel.section,
        levelDisplayNameAr: educationLevel.displayNameAr,
      })
      .from(classroom)
      .leftJoin(educationLevel, eq(classroom.educationLevelId, educationLevel.id))
      .where(and(eq(classroom.orgId, orgId), isNull(classroom.deletedAt)))

    // Get student and teacher counts for each classroom
    const classroomIds = results.map((r) => r.classroomId)

    const studentCounts = await this.db
      .select({
        classroomId: classroomStudentEnrollment.classroomId,
        studentCount: count(classroomStudentEnrollment.studentId),
      })
      .from(classroomStudentEnrollment)
      .where(
        and(
          eq(classroomStudentEnrollment.orgId, orgId),
          eq(classroomStudentEnrollment.status, 'active'),
          isNull(classroomStudentEnrollment.deletedAt)
        )
      )
      .groupBy(classroomStudentEnrollment.classroomId)

    const teacherCounts = await this.db
      .select({
        classroomId: classroomTeacherAssignment.classroomId,
        teacherCount: count(classroomTeacherAssignment.teacherId),
      })
      .from(classroomTeacherAssignment)
      .where(and(eq(classroomTeacherAssignment.orgId, orgId), isNull(classroomTeacherAssignment.deletedAt)))
      .groupBy(classroomTeacherAssignment.classroomId)

    // Create maps for quick lookup
    const studentCountMap = new Map(studentCounts.map((sc) => [sc.classroomId, sc.studentCount]))
    const teacherCountMap = new Map(teacherCounts.map((tc) => [tc.classroomId, tc.teacherCount]))

    return results.map((row) => ({
      id: row.classroomId,
      name: row.classroomName,
      academicYear: row.classroomAcademicYear,
      educationLevelId: row.classroomEducationLevelId,
      educationLevel: {
        id: row.levelId,
        level: row.levelLevel,
        section: row.levelSection,
        displayNameAr: row.levelDisplayNameAr,
      },
      studentCount: studentCountMap.get(row.classroomId) || 0,
      teacherCount: teacherCountMap.get(row.classroomId) || 0,
    })) as unknown as ClassroomListItem
  }

  async getClassroomById(classroomId: string, orgId: string) {
    const result = await this.db
      .select({
        classroomId: classroom.id,
        classroomName: classroom.name,
        classroomCode: classroom.code,
        classroomAcademicYear: classroom.academicYear,
        classroomCapacity: classroom.capacity,
        classroomEducationLevelId: classroom.educationLevelId,
        classroomOrgId: classroom.orgId,
        classroomCreatedAt: classroom.createdAt,
        classroomUpdatedAt: classroom.updatedAt,
        classroomDeletedAt: classroom.deletedAt,
        levelId: educationLevel.id,
        levelLevel: educationLevel.level,
        levelSection: educationLevel.section,
        levelDisplayNameAr: educationLevel.displayNameAr,
        levelDisplayNameEn: educationLevel.displayNameEn,
        levelDisplayNameFr: educationLevel.displayNameFr,
      })
      .from(classroom)
      .leftJoin(educationLevel, eq(classroom.educationLevelId, educationLevel.id))
      .where(and(eq(classroom.id, classroomId), eq(classroom.orgId, orgId), isNull(classroom.deletedAt)))

    if (!result[0] || result.length === 0) {
      throw new Error('Classroom not found')
    }

    // Get student and teacher counts
    const studentCount = await this.db
      .select({ count: count(classroomStudentEnrollment.studentId) })
      .from(classroomStudentEnrollment)
      .where(
        and(
          eq(classroomStudentEnrollment.classroomId, classroomId),
          eq(classroomStudentEnrollment.orgId, orgId),
          eq(classroomStudentEnrollment.status, 'active'),
          isNull(classroomStudentEnrollment.deletedAt)
        )
      )

    const teacherCount = await this.db
      .select({ count: count(classroomTeacherAssignment.teacherId) })
      .from(classroomTeacherAssignment)
      .where(
        and(
          eq(classroomTeacherAssignment.classroomId, classroomId),
          eq(classroomTeacherAssignment.orgId, orgId),
          isNull(classroomTeacherAssignment.deletedAt)
        )
      )

    const row = result[0]
    return {
      id: row.classroomId,
      name: row.classroomName,
      code: row.classroomCode,
      academicYear: row.classroomAcademicYear,
      capacity: row.classroomCapacity,
      educationLevelId: row.classroomEducationLevelId,
      orgId: row.classroomOrgId,
      createdAt: row.classroomCreatedAt,
      updatedAt: row.classroomUpdatedAt,
      deletedAt: row.classroomDeletedAt,
      educationLevel: {
        id: row.levelId,
        level: row.levelLevel,
        section: row.levelSection,
        displayNameAr: row.levelDisplayNameAr,
        displayNameEn: row.levelDisplayNameEn,
        displayNameFr: row.levelDisplayNameFr,
      },
      studentCount: studentCount[0]?.count || 0,
      teacherCount: teacherCount[0]?.count || 0,
    }
  }
}

// Factory function to create service instance
export function createClassroomManagementService(db: NodePgDatabase) {
  return new ClassroomManagementService(db)
}

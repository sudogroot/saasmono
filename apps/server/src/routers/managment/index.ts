// all routes exported here
import { classroomManagementRouter } from './classrooms'
import { curriculumManagementRouter } from './curriculum'
import { studentManagementRouter } from './students'
import { teacherManagementRouter } from './teachers'
import { userManagementRouter } from './user'

export const managementRouter = {
  users: userManagementRouter,
  teachers: teacherManagementRouter,
  students: studentManagementRouter,
  curriculum: curriculumManagementRouter,
  classroom: classroomManagementRouter,
}

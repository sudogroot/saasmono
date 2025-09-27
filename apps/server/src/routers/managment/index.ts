// all routes exported here
import { classroomManagementRouter } from './classrooms'
import { curriculumManagementRouter } from './curriculum'
import { parentManagementRouter } from './parents'
import { studentManagementRouter } from './students'
import { teacherManagementRouter } from './teachers'
import { userManagementRouter } from './user'

export const managementRouter = {
  users: userManagementRouter,
  teachers: teacherManagementRouter,
  students: studentManagementRouter,
  parents: parentManagementRouter,
  curriculum: curriculumManagementRouter,
  classroom: classroomManagementRouter,
}

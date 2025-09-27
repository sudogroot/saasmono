// all routes exported here
import { classroomManagementRouter } from './classrooms'
import { curriculumManagementRouter } from './curriculum'
import { teacherManagementRouter } from './teachers'
import { userManagementRouter } from './user'

export const managementRouter = {
  users: userManagementRouter,
  teachers: teacherManagementRouter,
  curriculum: curriculumManagementRouter,
  classroom: classroomManagementRouter,
}

// all routes exported here
import { classroomManagementRouter } from './classrooms'
import { curriculumManagementRouter } from './curriculum'
import { userManagementRouter } from './user'

export const managementRouter = {
  users: userManagementRouter,
  curriculum: curriculumManagementRouter,
  classroom: classroomManagementRouter,
}

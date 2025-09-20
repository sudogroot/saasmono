// all routes exported here
import { userManagementRouter } from './user'
import { curriculumManagementRouter } from './curriculum'

export const managementRouter = {
  users: userManagementRouter,
  curriculum: curriculumManagementRouter,
}

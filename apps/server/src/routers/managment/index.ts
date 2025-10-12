// all routes exported here
import { classroomManagementRouter } from './classrooms'
import { curriculumManagementRouter } from './curriculum'
import { parentManagementRouter } from './parents'
import { studentManagementRouter } from './students'
import { teacherManagementRouter } from './teachers'
import { timetableManagementRouter } from './timetable'
import { userManagementRouter } from './user'
import { sessionNoteManagementRouter } from './sessionNotes'
import { attendanceManagementRouter } from './attendances'
import { attendance } from '@/db/schema/attendance'

export const managementRouter = {
  users: userManagementRouter,
  teachers: teacherManagementRouter,
  students: studentManagementRouter,
  parents: parentManagementRouter,
  curriculum: curriculumManagementRouter,
  classroom: classroomManagementRouter,
  timetables: timetableManagementRouter,
  sessionNotes: sessionNoteManagementRouter,
  attendances: attendanceManagementRouter
}

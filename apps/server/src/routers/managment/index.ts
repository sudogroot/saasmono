// all routes exported here
import { attendanceManagementRouter } from './attendances'
import { classroomManagementRouter } from './classrooms'
import { curriculumManagementRouter } from './curriculum'
import { latePassTicketRouter } from './late-pass-tickets'
import { parentManagementRouter } from './parents'
import { sessionNoteManagementRouter } from './sessionNotes'
import { studentManagementRouter } from './students'
import { teacherManagementRouter } from './teachers'
import { timetableManagementRouter } from './timetable'
import { userManagementRouter } from './user'

export const managementRouter = {
  users: userManagementRouter,
  teachers: teacherManagementRouter,
  students: studentManagementRouter,
  parents: parentManagementRouter,
  curriculum: curriculumManagementRouter,
  classroom: classroomManagementRouter,
  timetables: timetableManagementRouter,
  sessionNotes: sessionNoteManagementRouter,
  attendances: attendanceManagementRouter,
  latePassTickets: latePassTicketRouter,
}

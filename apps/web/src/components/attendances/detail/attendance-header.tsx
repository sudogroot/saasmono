'use client'

import { Badge, Button } from '@repo/ui'
import { Calendar, Clock, Edit, Building2, Users, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AttendanceHeaderProps {
  timetable: {
    id: string
    title: string
    startDateTime: Date
    endDateTime: Date
  }
  classroom: {
    id: string
    name: string
  } | null
  classroomGroup: {
    id: string
    name: string
  } | null
  createdBy: {
    id: string
    name: string
    lastName: string
    userType: string
  }
  createdAt: Date
  sessionId: string
}

export function AttendanceHeader({
  timetable,
  classroom,
  classroomGroup,
  createdBy,
  createdAt,
  sessionId,
}: AttendanceHeaderProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/dashboard/attendances/${sessionId}/edit`)
  }

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'teacher':
        return 'default'
      case 'admin':
        return 'destructive'
      case 'staff':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'teacher':
        return 'معلم'
      case 'admin':
        return 'مدير'
      case 'staff':
        return 'موظف'
      default:
        return userType
    }
  }

  return (
    <div className="space-y-4">
      {/* Decorative gradient header */}
      <div className="h-32 w-full rounded-t-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />

      {/* Attendance header info */}
      <div className="px-6 pb-6 -mt-16">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* Title and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg shrink-0">
                <Calendar className="text-primary h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground break-words">{timetable.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                  <User className="h-3 w-3" />
                  <span>أنشئت بواسطة: {createdBy.name} {createdBy.lastName}</span>
                  <Badge variant={getUserTypeBadgeVariant(createdBy.userType)} className="text-xs mr-2">
                    {getUserTypeLabel(createdBy.userType)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 ml-1" />
                تعديل
              </Button>
            </div>
          </div>

          {/* Timetable info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">معلومات الجلسة</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">التاريخ والوقت</div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3" />
                  {new Date(timetable.startDateTime).toLocaleDateString('ar-SA')}
                  {' - '}
                  {new Date(timetable.startDateTime).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' إلى '}
                  {new Date(timetable.endDateTime).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">الفصل / المجموعة</div>
                <div className="flex items-center gap-2 text-sm">
                  {classroom ? (
                    <>
                      <Building2 className="h-3 w-3" />
                      {classroom.name}
                    </>
                  ) : classroomGroup ? (
                    <>
                      <Users className="h-3 w-3" />
                      {classroomGroup.name}
                    </>
                  ) : (
                    <span className="text-muted-foreground">غير محدد</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

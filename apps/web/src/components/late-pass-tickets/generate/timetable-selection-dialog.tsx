'use client'

import { orpc } from '@/utils/orpc'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Calendar, CheckCircle, Clock, DoorClosed, Ticket, User, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface TimetableSelectionDialogProps {
  student: {
    id: string
    name: string
    lastName: string
    email: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UpcomingTimetable {
  id: string
  title: string
  startDateTime: Date
  endDateTime: Date
  educationSubject: {
    id: string
    displayNameAr: string
    displayNameEn: string | null
  } | null
  room: {
    id: string
    name: string
  }
  teacher: {
    id: string
    name: string
    lastName: string
  }
  hasActiveTicket: boolean
  canGenerateTicket: boolean
}

export function TimetableSelectionDialog({
  student,
  open,
  onOpenChange,
}: TimetableSelectionDialogProps) {
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null)

  // Fetch upcoming timetables for the student
  const { data: timetables = [], isLoading } = useQuery({
      ...orpc.management.latePassTickets.getStudentUpcomingTimetables.queryOptions({
      input: {
        studentId: student.id
      }
    }),
      enabled: open,
    })

  const typedTimetables = (timetables as UpcomingTimetable[]) || []

  // Generate ticket mutation
  const generateTicketMutation = useMutation({
    ...orpc.management.latePassTickets.generateTicket.mutationOptions(),
    onSuccess: (data: any) => {
      toast.success('تم إصدار التذكرة بنجاح', {
        description: `رقم التذكرة: ${data.ticketNumber}`,
        action: data.pdfPath
          ? {
              label: 'تحميل التذكرة',
              onClick: () => {
                window.open(
                  `${process.env.NEXT_PUBLIC_SERVER_URL}/public/${data.pdfPath}`,
                  '_blank'
                )
              },
            }
          : undefined,
      })
      onOpenChange(false)
      setSelectedTimetableId(null)
    },
    onError: (error: any) => {
      toast.error('فشل إصدار التذكرة', {
        description: error.message,
      })
    },
  })

  const handleGenerateTicket = () => {
    if (!selectedTimetableId) {
      toast.error('يرجى اختيار حصة')
      return
    }
    generateTicketMutation.mutate({
      studentId: student.id,
      timetableId: selectedTimetableId,
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            إصدار تذكرة دخول متأخر
          </DialogTitle>
          <DialogDescription>
            اختر الحصة لإصدار تذكرة دخول للطالب{' '}
            <span className="font-medium">
              {student.name} {student.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {student.name} {student.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{student.email}</div>
              </div>
            </div>
          </div>

          {/* Upcoming Timetables */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">الحصص القادمة:</h4>

            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                جاري التحميل...
              </div>
            )}

            {!isLoading && typedTimetables.length === 0 && (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">لا توجد حصص قادمة لهذا الطالب</p>
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {typedTimetables.map((timetable) => (
                <div
                  key={timetable.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTimetableId === timetable.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  } ${
                    !timetable.canGenerateTicket
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => {
                    if (timetable.canGenerateTicket) {
                      setSelectedTimetableId(timetable.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">
                        {timetable.title}
                      </div>
                      {timetable.educationSubject && (
                        <div className="text-sm text-muted-foreground">
                          {timetable.educationSubject.displayNameAr}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {timetable.hasActiveTicket && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-700"
                        >
                          تذكرة نشطة
                        </Badge>
                      )}
                      {timetable.canGenerateTicket ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(timetable.startDateTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(timetable.startDateTime)} -{' '}
                      {formatTime(timetable.endDateTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DoorClosed className="h-3 w-3" />
                      {timetable.room.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {timetable.teacher.name} {timetable.teacher.lastName}
                    </div>
                  </div>

                  {!timetable.canGenerateTicket && (
                    <div className="mt-2 text-xs text-red-600">
                      لا يمكن إصدار تذكرة لهذه الحصة (خارج الفترة الزمنية المسموحة)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedTimetableId(null)
            }}
            disabled={generateTicketMutation.isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleGenerateTicket}
            disabled={
              !selectedTimetableId ||
              generateTicketMutation.isPending ||
              !typedTimetables.find((t) => t.id === selectedTimetableId)
                ?.canGenerateTicket
            }
          >
            {generateTicketMutation.isPending ? (
              <>جاري الإصدار...</>
            ) : (
              <>
                <Ticket className="h-4 w-4 ml-1" />
                إصدار التذكرة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

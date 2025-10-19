'use client'

import { orpc } from '@/utils/orpc'
import { Badge, Button, GenericTable } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Calendar,
  ChevronRight,
  Download,
  Mail,
  Ticket,
  User,
  UserX,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ClassroomFilter } from './classroom-filter'
import { TimetableSelectionDialog } from './timetable-selection-dialog'

type AttendanceStatus = 'ABSENT' | 'EXCUSED' | 'SICK'

interface EligibleStudent {
  id: string
  name: string
  lastName: string
  email: string
  lastAttendance: {
    id: string
    status: AttendanceStatus
    markedAt: Date
    timetable: {
      id: string
      title: string
      startDateTime: Date
    }
  } | null
  upcomingTimetablesCount: number
  activeTicketsCount: number
  activeTickets: {
    id: string
    ticketNumber: string
    pdfPath: string | null
    expiresAt: Date
    timetable: {
      title: string
    }
  }[]
}

interface EligibleStudentsTableProps {
  classroomId: string | null
  classroomGroupId: string | null
  onClassroomChange: (id: string | null) => void
  onClassroomGroupChange: (id: string | null) => void
}

const columnHelper = createColumnHelper<EligibleStudent>()

export function EligibleStudentsTable({
  classroomId,
  classroomGroupId,
  onClassroomChange,
  onClassroomGroupChange,
}: EligibleStudentsTableProps) {
  const [searchValue, setSearchValue] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  // Selected student for timetable selection dialog
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch eligible students
  const { data: students = [], isLoading, error } = useQuery({
    ...orpc.management.latePassTickets.getEligibleStudents.queryOptions({
      input: {
        classroomId: classroomId || undefined,
        classroomGroupId: classroomGroupId || undefined,
      }
    }),
    enabled: !!(classroomId || classroomGroupId),
  })

  const typedStudents = (students as EligibleStudent[]) || []

  const handleSelectStudent = (student: EligibleStudent) => {
    if (student.upcomingTimetablesCount === 0) {
      toast.error('لا توجد حصص قادمة لهذا الطالب')
      return
    }
    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  const handleDownloadPDF = useCallback((pdfPath: string | null) => {
    if (!pdfPath) {
      toast.error('التذكرة غير متوفرة')
      return
    }
    window.open(`${process.env.NEXT_PUBLIC_SERVER_URL}/public/${pdfPath}`, '_blank')
  }, [])

  const getAttendanceStatusBadge = (status: AttendanceStatus) => {
    const statusConfig = {
      ABSENT: { label: 'غائب', className: 'bg-red-100 text-red-700' },
      EXCUSED: { label: 'غياب بعذر', className: 'bg-yellow-100 text-yellow-700' },
      SICK: { label: 'مريض', className: 'bg-orange-100 text-orange-700' },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'student',
        header: 'الطالب',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <User className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-medium">
                {row.original.name} {row.original.lastName}
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'lastAttendance',
        header: 'آخر حضور',
        cell: ({ row }) => {
          const lastAttendance = row.original.lastAttendance
          if (!lastAttendance) {
            return (
              <Badge variant="secondary" className="text-xs">
                لا توجد بيانات
              </Badge>
            )
          }
          return (
            <div className="space-y-1">
              <div>{getAttendanceStatusBadge(lastAttendance.status)}</div>
              <div className="text-xs text-muted-foreground">
                {lastAttendance.timetable.title}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(lastAttendance.timetable.startDateTime)}
              </div>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'upcomingTimetables',
        header: 'الحصص القادمة',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium text-sm">
              {row.original.upcomingTimetablesCount} حصة
            </div>
            {row.original.activeTicketsCount > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {row.original.activeTicketsCount} تذكرة نشطة
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectStudent(row.original)}
              disabled={row.original.upcomingTimetablesCount === 0}
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              إصدار تذكرة
            </Button>
            {row.original.activeTickets.length > 0 && row.original.activeTickets[0] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadPDF(row.original.activeTickets[0]!.pdfPath)}
                disabled={!row.original.activeTickets[0]!.pdfPath}
                title="تحميل التذكرة"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      }),
    ],
    [handleDownloadPDF]
  )

  const table = useReactTable({
    data: typedStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const student = row.original
      const searchableText = [
        student.name,
        student.lastName,
        `${student.name} ${student.lastName}`,
        student.email,
        student.lastAttendance?.timetable.title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(filterValue.toLowerCase())
    },
    state: {
      globalFilter: searchValue,
      pagination,
    },
    onPaginationChange: setPagination,
  })

  const mobileCardRenderer = (row: any) => (
    <div
      className="bg-white px-4 py-3 cursor-pointer hover:bg-gray-50"
      onClick={() => handleSelectStudent(row.original)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <User className="text-primary h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-sm">
              {row.original.name} {row.original.lastName}
            </div>
            <div className="text-muted-foreground text-xs">{row.original.email}</div>
          </div>
        </div>
      </div>

      {row.original.lastAttendance && (
        <div className="mb-2">
          {getAttendanceStatusBadge(row.original.lastAttendance.status)}
          <div className="text-xs text-muted-foreground mt-1">
            {row.original.lastAttendance.timetable.title}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{row.original.upcomingTimetablesCount} حصة قادمة</span>
        {row.original.activeTicketsCount > 0 && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            {row.original.activeTicketsCount} تذكرة نشطة
          </Badge>
        )}
      </div>
    </div>
  )

  // Show filter when no classroom selected
  if (!classroomId && !classroomGroupId) {
    return (
      <div className="space-y-6">
        <ClassroomFilter
          selectedClassroomId={classroomId}
          selectedClassroomGroupId={classroomGroupId}
          onClassroomChange={onClassroomChange}
          onClassroomGroupChange={onClassroomGroupChange}
        />

        <div className="flex min-h-[300px] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <UserX className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">اختر الفصل أو المجموعة</h3>
              <p className="text-muted-foreground mt-1">
                يرجى اختيار فصل أو مجموعة لعرض الطلاب المؤهلين
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state when no eligible students
  if (typedStudents.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        <ClassroomFilter
          selectedClassroomId={classroomId}
          selectedClassroomGroupId={classroomGroupId}
          onClassroomChange={onClassroomChange}
          onClassroomGroupChange={onClassroomGroupChange}
        />

        <div className="flex min-h-[300px] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Ticket className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">لا يوجد طلاب مؤهلين</h3>
              <p className="text-muted-foreground mt-1">
                لا يوجد طلاب متغيبين في هذا الفصل أو المجموعة
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <ClassroomFilter
          selectedClassroomId={classroomId}
          selectedClassroomGroupId={classroomGroupId}
          onClassroomChange={onClassroomChange}
          onClassroomGroupChange={onClassroomGroupChange}
        />

        <GenericTable
          table={table}
          isLoading={isLoading}
          error={error}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="البحث عن طالب (الاسم، البريد، الحصة...)"
          noDataMessage="لا يوجد طلاب مطابقون للبحث"
          mobileCardRenderer={mobileCardRenderer}
          enableVirtualScroll={true}
          virtualItemHeight={100}
          className="w-full"
        />
      </div>

      {selectedStudent && (
        <TimetableSelectionDialog
          student={selectedStudent}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  )
}

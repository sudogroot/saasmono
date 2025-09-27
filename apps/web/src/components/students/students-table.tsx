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
import { BookOpen, Building2, Eye, Mail, Plus, User, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StudentViewSheet } from './student-view-sheet'

interface StudentEducationLevel {
  id: string
  level: number
  displayNameAr: string | null
}

interface StudentClassroom {
  id: string
  name: string
  code: string
  academicYear: string
  enrollmentDate: Date
  enrollmentStatus: string
  educationLevel: StudentEducationLevel
}

interface StudentListItem {
  id: string
  name: string
  lastName: string
  email: string
  userType: 'student'
  createdAt: Date
  updatedAt: Date
  classroom: StudentClassroom | null
}

interface StudentsTableProps {
  onEdit?: (studentId: string) => void
  onCreateNew?: () => void
}

const columnHelper = createColumnHelper<StudentListItem>()

export function StudentsTable({ onEdit, onCreateNew }: StudentsTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const { data: students = [], isLoading, error } = useQuery(orpc.management.students.getStudentsList.queryOptions({}))

  // Type assertion for students data
  const typedStudents = (students as StudentListItem[]) || []

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'الاسم',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{`${info.row.original.name} ${info.row.original.lastName}`}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {info.row.original.email}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('classroom', {
        header: 'الفصل الدراسي',
        cell: (info) => {
          const classroom = info.getValue()
          if (!classroom) {
            return (
              <Badge variant="secondary" className="gap-1">
                <Building2 className="w-3 h-3" />
                غير مسجل في فصل
              </Badge>
            )
          }
          return (
            <div className="space-y-1">
              <Badge variant="default" className="gap-1">
                <Building2 className="w-3 h-3" />
                {classroom.name}
              </Badge>
              <div className="text-xs text-muted-foreground">
                الكود: {classroom.code} | العام الدراسي: {classroom.academicYear}
              </div>
              <div className="text-xs text-muted-foreground">
                المستوى: {classroom.educationLevel.displayNameAr || `الصف ${classroom.educationLevel.level}`}
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('classroom.enrollmentStatus', {
        header: 'حالة التسجيل',
        cell: (info) => {
          const status = info.getValue()
          if (!status) {
            return (
              <Badge variant="secondary">
                غير مسجل
              </Badge>
            )
          }

          const statusConfig = {
            active: { label: 'نشط', variant: 'default' as const },
            inactive: { label: 'غير نشط', variant: 'secondary' as const },
            transferred: { label: 'محول', variant: 'destructive' as const },
          }

          const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            variant: 'secondary' as const
          }

          return (
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'الإجراءات',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStudent(info.row.original)
                setIsViewSheetOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
              عرض
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(info.row.original.id)}
              >
                تعديل
              </Button>
            )}
          </div>
        ),
      }),
    ],
    [onEdit]
  )

  const quickFilters = useMemo(
    () => [
      {
        key: 'enrollmentStatus',
        label: 'حالة التسجيل',
        values: [
          { label: 'نشط', value: 'active' },
          { label: 'غير نشط', value: 'inactive' },
          { label: 'محول', value: 'transferred' },
        ],
      },
      {
        key: 'hasClassroom',
        label: 'الفصل الدراسي',
        values: [
          { label: 'مسجل في فصل', value: 'true' },
          { label: 'غير مسجل في فصل', value: 'false' },
        ],
      },
      {
        key: 'educationLevel',
        label: 'المستوى التعليمي',
        values: [
          { label: 'المستوى 1', value: '1' },
          { label: 'المستوى 2', value: '2' },
          { label: 'المستوى 3', value: '3' },
          { label: 'المستوى 4', value: '4' },
          { label: 'المستوى 5', value: '5' },
          { label: 'المستوى 6', value: '6' },
        ],
      },
      {
        key: 'classroom',
        label: 'الفصل الدراسي',
        values: [
          // This would be dynamically populated from available classrooms
          // For now, we'll use common classroom codes
          { label: 'A', value: 'A' },
          { label: 'B', value: 'B' },
          { label: 'C', value: 'C' },
        ],
      },
      {
        key: 'joinedRecently',
        label: 'تاريخ الانضمام',
        values: [
          { label: 'انضم خلال الشهر الماضي', value: 'month' },
          { label: 'انضم خلال الـ 3 أشهر الماضية', value: 'quarter' },
          { label: 'انضم خلال السنة الماضية', value: 'year' },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = typedStudents

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'enrollmentStatus':
          filtered = filtered.filter((student) =>
            student.classroom?.enrollmentStatus === value
          )
          break
        case 'hasClassroom':
          const hasClassroom = value === 'true'
          filtered = filtered.filter((student) =>
            hasClassroom ? !!student.classroom : !student.classroom
          )
          break
        case 'educationLevel':
          filtered = filtered.filter((student) =>
            student.classroom?.educationLevel.level.toString() === value
          )
          break
        case 'classroom':
          filtered = filtered.filter((student) =>
            student.classroom?.code === value || student.classroom?.name.includes(value)
          )
          break
        case 'joinedRecently':
          const now = new Date()
          let cutoffDate = new Date()

          switch (value) {
            case 'month':
              cutoffDate.setMonth(now.getMonth() - 1)
              break
            case 'quarter':
              cutoffDate.setMonth(now.getMonth() - 3)
              break
            case 'year':
              cutoffDate.setFullYear(now.getFullYear() - 1)
              break
          }

          filtered = filtered.filter((student) => new Date(student.createdAt) >= cutoffDate)
          break
      }
    })

    return filtered
  }, [typedStudents, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const student = row.original
      const searchableText = [
        student.name,
        student.lastName,
        student.email,
        `${student.name} ${student.lastName}`,
        student.classroom?.name,
        student.classroom?.code,
        student.classroom?.academicYear,
        student.classroom?.educationLevel.displayNameAr || `المستوى ${student.classroom?.educationLevel.level}`,
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

  const handleViewStudent = (student: StudentListItem) => {
    setSelectedStudent(student)
    setIsViewSheetOpen(true)
  }

  return (
    <>
      <GenericTable
        table={table}
        isLoading={isLoading}
        error={error}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="البحث عن طالب (الاسم، البريد، الفصل، المستوى...)"
        noDataMessage="لا يوجد طلاب مطابقون للبحث"
        showQuickFilters={true}
        quickFilters={quickFilters}
        activeFilters={activeFilters}
        onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
        headerActions={onCreateNew ? (
          <Button onClick={onCreateNew}>
            <Plus className="ml-1 h-4 w-4" />
            إضافة طالب
          </Button>
        ) : undefined}
        enableVirtualScroll={true}
        virtualItemHeight={72}
        className="w-full"
        emptyState={{
          icon: Users,
          title: 'لا توجد بيانات طلاب',
          description: 'لم يتم العثور على أي طلاب. قم بإضافة طالب جديد للبدء.',
          action: onCreateNew ? {
            label: 'إضافة طالب جديد',
            onClick: onCreateNew,
          } : undefined,
        }}
      />

      {selectedStudent && (
        <StudentViewSheet
          student={selectedStudent}
          open={isViewSheetOpen}
          onOpenChange={setIsViewSheetOpen}
        />
      )}
    </>
  )
}
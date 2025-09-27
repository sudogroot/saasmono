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

  const table = useReactTable({
    data: typedStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
        searchable={{
          enabled: true,
          placeholder: 'البحث عن طالب...',
          searchableColumns: ['name', 'email'],
        }}
        pagination={{
          enabled: true,
          pageSizeOptions: [10, 20, 50],
        }}
        toolbar={{
          actions: onCreateNew ? [
            {
              label: 'إضافة طالب جديد',
              icon: Plus,
              variant: 'default',
              onClick: onCreateNew,
            },
          ] : [],
        }}
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
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
import { Building2, Edit, Eye, GraduationCap, Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

interface EducationLevel {
  id: string
  level: number
  section: string | null
  displayNameAr: string | null
}

interface ClassroomListItem {
  id: string
  name: string
  academicYear: string
  educationLevelId: string
  educationLevel: EducationLevel
  studentCount: number
  teacherCount: number
}

interface ClassroomsTableProps {
  onEdit?: (classroomId: string) => void
  onDelete?: (classroomId: string) => void
  onView?: (classroomId: string) => void
  onCreateNew?: () => void
}

const columnHelper = createColumnHelper<ClassroomListItem>()

export function ClassroomsTable({ onEdit, onDelete, onView, onCreateNew }: ClassroomsTableProps) {
  const {
    data: classrooms = [],
    isLoading,
    error,
  } = useQuery(orpc.management.classroom.getClassroomsList.queryOptions())

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'classroom',
        header: 'الفصل الدراسي',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Building2 className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-medium">{row.original.name}</div>
              <div className="text-muted-foreground text-sm">العام الدراسي: {row.original.academicYear}</div>
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'level',
        header: 'المستوى التعليمي',
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
              المستوى {row.original.educationLevel.level}
              {row.original.educationLevel.section && ` - ${row.original.educationLevel.section}`}
            </Badge>
            {row.original.educationLevel.displayNameAr && (
              <div className="text-muted-foreground text-xs">{row.original.educationLevel.displayNameAr}</div>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'stats',
        header: 'الإحصائيات',
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Users className="text-muted-foreground h-3 w-3" />
              <span>{row.original.studentCount} طالب</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="text-muted-foreground h-3 w-3" />
              <span>{row.original.teacherCount} معلم</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('academicYear', {
        id: 'academicYear',
        header: 'العام الدراسي',
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs">
            {row.original.academicYear}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onView?.(row.original.id)} title="عرض">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit?.(row.original.id)} title="تعديل">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onView]
  )

  const quickFilters = useMemo(
    () => [
      {
        key: 'academicYear',
        label: 'العام الدراسي',
        values: Array.from(new Set(classrooms.map((c) => c.academicYear))).map((year) => ({
          label: year,
          value: year,
        })),
      },
      {
        key: 'hasStudents',
        label: 'حالة الطلاب',
        values: [
          { label: 'يحتوي على طلاب', value: 'true' },
          { label: 'فصل فارغ', value: 'false' },
        ],
      },
      {
        key: 'hasTeachers',
        label: 'حالة المعلمين',
        values: [
          { label: 'لديه معلمين', value: 'true' },
          { label: 'بدون معلمين', value: 'false' },
        ],
      },
    ],
    [classrooms]
  )

  const filteredData = useMemo(() => {
    let filtered = classrooms

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'academicYear':
          filtered = filtered.filter((classroom) => classroom.academicYear === value)
          break
        case 'hasStudents':
          const hasStudents = value === 'true'
          filtered = filtered.filter((classroom) =>
            hasStudents ? classroom.studentCount > 0 : classroom.studentCount === 0
          )
          break
        case 'hasTeachers':
          const hasTeachers = value === 'true'
          filtered = filtered.filter((classroom) =>
            hasTeachers ? classroom.teacherCount > 0 : classroom.teacherCount === 0
          )
          break
      }
    })

    return filtered
  }, [classrooms, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const classroom = row.original
      const searchableText = [
        classroom.name,
        classroom.academicYear,
        `المستوى ${classroom.educationLevel.level}`,
        classroom.educationLevel.section,
        classroom.educationLevel.displayNameAr,
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
    <div className="w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Building2 className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate font-medium">{row.original.name}</div>
            <div className="text-muted-foreground truncate text-sm">{row.original.academicYear}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                المستوى {row.original.educationLevel.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {row.original.studentCount} طالب
              </Badge>
              <Badge variant="outline" className="text-xs">
                {row.original.teacherCount} معلم
              </Badge>
            </div>
          </div>
        </div>

        <div className="mx-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onView?.(row.original.id)}
            title="عرض"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-border/30 h-px w-full" />
    </div>
  )

  const emptyStateAction = onCreateNew ? (
    <Button onClick={onCreateNew} className="mt-4">
      <Plus className="ml-1 h-4 w-4" />
      إضافة فصل دراسي جديد
    </Button>
  ) : null

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة فصل
    </Button>
  ) : null

  if (classrooms.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Building2 className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">لا توجد فصول دراسية</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة الفصول الدراسية لتنظيم العملية التعليمية</p>
          </div>
          {emptyStateAction}
        </div>
      </div>
    )
  }

  return (
    <GenericTable
      table={table}
      isLoading={isLoading}
      error={error}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="البحث عن فصل دراسي (الاسم، العام الدراسي، المستوى...)"
      noDataMessage="لا توجد فصول دراسية مطابقة للبحث"
      mobileCardRenderer={mobileCardRenderer}
      showQuickFilters={true}
      quickFilters={quickFilters}
      activeFilters={activeFilters}
      onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
      headerActions={headerActions}
      emptyStateAction={emptyStateAction}
      enableVirtualScroll={true}
      virtualItemHeight={60}
      className="w-full"
    />
  )
}

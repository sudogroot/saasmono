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
import { BookOpen, Edit, Eye, GraduationCap, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

interface EducationLevel {
  id: string
  level: number
  section: string | null
  displayNameAr: string | null
  isOptional: boolean
}

interface EducationSubject {
  id: string
  name: string
  displayNameAr: string
  displayDescriptionAr: string | null
  institutionLevelId: string
  educationLevels: EducationLevel[]
}

interface EducationSubjectTableProps {
  onEdit?: (subjectId: string) => void
  onDelete?: (subjectId: string) => void
  onView?: (subjectId: string) => void
  onCreateNew?: () => void
}

const columnHelper = createColumnHelper<EducationSubject>()

export function EducationSubjectTable({ onEdit, onDelete, onView, onCreateNew }: EducationSubjectTableProps) {
  const {
    data: subjects = [],
    isLoading,
    error,
  } = useQuery(orpc.management.curriculum.getEducationSubjectsList.queryOptions())

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('displayNameAr', {
        id: 'subject',
        header: 'المادة الدراسية',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-medium">{row.original.displayNameAr}</div>
              <div className="text-muted-foreground text-sm">{row.original.name}</div>
              {row.original.displayDescriptionAr && (
                <div className="text-muted-foreground max-w-[200px] truncate text-xs">
                  {row.original.displayDescriptionAr}
                </div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'levels',
        header: 'المستويات التعليمية',
        cell: ({ row }) => (
          <div className="space-y-1">
            {row.original.educationLevels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.original.educationLevels.slice(0, 3).map((level) => (
                  <Badge
                    key={level.id}
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-xs font-medium text-blue-700"
                  >
                    المستوى {level.level}
                    {level.section && ` - ${level.section}`}
                    {level.isOptional && ' (اختياري)'}
                  </Badge>
                ))}
                {row.original.educationLevels.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{row.original.educationLevels.length - 3} أخرى
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">لا توجد مستويات مُعيَّنة</div>
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
              <GraduationCap className="text-muted-foreground h-3 w-3" />
              <span>{row.original.educationLevels.length} مستوى</span>
            </div>
            <div className="text-muted-foreground text-xs">
              {row.original.educationLevels.filter((l) => l.isOptional).length} اختياري
            </div>
          </div>
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
        key: 'hasLevels',
        label: 'حالة المستويات',
        values: [
          { label: 'لديها مستويات معيَّنة', value: 'true' },
          { label: 'بدون مستويات معيَّنة', value: 'false' },
        ],
      },
      {
        key: 'hasOptional',
        label: 'المواد الاختيارية',
        values: [
          { label: 'تحتوي على مواد اختيارية', value: 'true' },
          { label: 'كلها مواد إجبارية', value: 'false' },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = subjects

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'hasLevels':
          const hasLevels = value === 'true'
          filtered = filtered.filter((subject) =>
            hasLevels ? subject.educationLevels.length > 0 : subject.educationLevels.length === 0
          )
          break
        case 'hasOptional':
          const hasOptional = value === 'true'
          filtered = filtered.filter((subject) =>
            hasOptional
              ? subject.educationLevels.some((l) => l.isOptional)
              : !subject.educationLevels.some((l) => l.isOptional)
          )
          break
      }
    })

    return filtered
  }, [subjects, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const subject = row.original
      const searchableText = [
        subject.displayNameAr,
        subject.name,
        subject.displayDescriptionAr,
        ...subject.educationLevels.map((l) => `المستوى ${l.level} ${l.section || ''}`),
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
            <BookOpen className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate font-medium">{row.original.displayNameAr}</div>
            <div className="text-muted-foreground truncate text-sm">{row.original.name}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {row.original.educationLevels.length} مستوى
              </Badge>
              {row.original.educationLevels.some((l: EducationLevel) => l.isOptional) && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  اختياري
                </Badge>
              )}
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
      إضافة مادة دراسية جديدة
    </Button>
  ) : null

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة مادة
    </Button>
  ) : null

  if (subjects.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <BookOpen className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">لا توجد مواد دراسية</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة المواد الدراسية لتنظيم المنهج التعليمي</p>
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
      searchPlaceholder="البحث عن مادة دراسية (الاسم، الوصف، المستويات...)"
      noDataMessage="لا توجد مواد دراسية مطابقة للبحث"
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

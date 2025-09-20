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
import { Edit, Eye, GraduationCap, Mail, Plus, User } from 'lucide-react'
import { useMemo, useState } from 'react'

interface UserListItem {
  id: string
  name: string
  lastName: string
  email: string
  userType: 'teacher' | 'student' | 'parent' | 'staff'
  createdAt: Date
  updatedAt: Date
}

interface TeachersTableProps {
  onEdit?: (teacherId: string) => void
  onDelete?: (teacherId: string) => void
  onView?: (teacherId: string) => void
  onCreateNew?: () => void
}

const columnHelper = createColumnHelper<UserListItem>()

export function TeachersTable({ onEdit, onDelete, onView, onCreateNew }: TeachersTableProps) {
  const {
    data: teachers = [],
    isLoading,
    error,
  } = useQuery(
    orpc.management.users.listUsers.queryOptions({
      input: {
        userType: 'teacher',
      },
    })
  )

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'teacher',
        header: 'المعلم',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <User className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="text-foreground font-medium">
                {row.original.name} {row.original.lastName}
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('userType', {
        id: 'type',
        header: 'النوع',
        cell: ({ row }) => (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <GraduationCap className="ml-1 h-3 w-3" />
            معلم
          </Badge>
        ),
      }),
      columnHelper.accessor('createdAt', {
        id: 'joinDate',
        header: 'تاريخ الانضمام',
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="text-foreground">
              {new Date(row.original.createdAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-muted-foreground text-xs">
              {new Date(row.original.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('updatedAt', {
        id: 'lastUpdate',
        header: 'آخر تحديث',
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="text-foreground">
              {new Date(row.original.updatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-muted-foreground text-xs">
              منذ {Math.floor((Date.now() - new Date(row.original.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} يوم
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
            نشط
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
        key: 'joinedRecently',
        label: 'تاريخ الانضمام',
        values: [
          { label: 'انضم خلال الشهر الماضي', value: 'month' },
          { label: 'انضم خلال الـ 3 أشهر الماضية', value: 'quarter' },
          { label: 'انضم خلال السنة الماضية', value: 'year' },
        ],
      },
      {
        key: 'nameSort',
        label: 'ترتيب الأسماء',
        values: [
          { label: 'ترتيب أبجدي (أ-ي)', value: 'asc' },
          { label: 'ترتيب أبجدي عكسي (ي-أ)', value: 'desc' },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = teachers

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
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

          filtered = filtered.filter((teacher) => new Date(teacher.createdAt) >= cutoffDate)
          break
        case 'nameSort':
          filtered = [...filtered].sort((a, b) => {
            const nameA = `${a.name} ${a.lastName}`.toLowerCase()
            const nameB = `${b.name} ${b.lastName}`.toLowerCase()
            return value === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
          })
          break
      }
    })

    return filtered
  }, [teachers, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const teacher = row.original
      const searchableText = [
        teacher.name,
        teacher.lastName,
        teacher.email,
        `${teacher.name} ${teacher.lastName}`,
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
            <User className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate font-medium">
              {row.original.name} {row.original.lastName}
            </div>
            <div className="text-muted-foreground truncate text-sm">{row.original.email}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-green-600">
                معلم
              </Badge>
              <Badge variant="outline" className="text-xs text-blue-600">
                نشط
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
      إضافة معلم جديد
    </Button>
  ) : null

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة معلم
    </Button>
  ) : null

  if (teachers.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <User className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">لا يوجد معلمون</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة المعلمين لإدارة الهيئة التدريسية</p>
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
      searchPlaceholder="البحث عن معلم (الاسم، الكنية، البريد الإلكتروني...)"
      noDataMessage="لا يوجد معلمون مطابقون للبحث"
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
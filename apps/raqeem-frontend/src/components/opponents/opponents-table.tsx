'use client'

import { GenericTable } from '@/components/base/table'
import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import type { OpponentListItem } from '@/types'
import { Badge, Button } from '@repo/ui'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Edit, Eye, Plus, Trash2, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { OpponentAvatar } from './opponent-avatar'

interface OpponentsTableProps {
  opponents: OpponentListItem[]
  isLoading?: boolean
  error?: Error | null
  onEdit?: (opponentId: string) => void
  onDelete?: (opponentId: string) => void
  onView?: (opponentId: string) => void
  onCreateNew?: () => void
  organizationSlug?: string
  slug?: string
}

const columnHelper = createColumnHelper<OpponentListItem>()

const opponentTypeColors = {
  individual: 'bg-red-50 text-red-700 border-red-200',
  company: 'bg-orange-50 text-orange-700 border-orange-200',
  institution: 'bg-pink-50 text-pink-700 border-pink-200',
  organization: 'bg-purple-50 text-purple-700 border-purple-200',
  government: 'bg-gray-50 text-gray-700 border-gray-200',
  association: 'bg-rose-50 text-rose-700 border-rose-200',
} as const

const opponentTypeLabels = {
  individual: 'فرد',
  company: 'شركة',
  institution: 'مؤسسة',
  organization: 'منظمة',
  government: 'حكومي',
  association: 'جمعية',
} as const

export function OpponentsTable({
  opponents,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  onView,
  onCreateNew,
  organizationSlug,
  slug,
}: OpponentsTableProps) {
  const pathname = usePathname()
  const currentSlug = slug || pathname.split('/')[2] || ''
  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'opponent',
        header: 'الخصم',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {/*<OpponentAvatar opponent={row.original} size="md" />*/}
            <div>
              <div className="text-foreground font-medium">{row.original.name}</div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('opponentType', {
        id: 'type',
        header: 'النوع',
        cell: ({ getValue }) => {
          const opponentType = getValue() as keyof typeof opponentTypeColors
          return (
            <Badge variant="outline" className={cn('font-medium', opponentTypeColors[opponentType])}>
              {opponentTypeLabels[opponentType]}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: 'تاريخ الإضافة',
        cell: ({ getValue }) => (
          <div className="text-muted-foreground text-sm">
            {new Date(getValue()).toLocaleDateString('ar-TN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                globalSheet.openOpponentDetails({
                  slug: currentSlug,
                  opponentId: row.original.id,
                  size: 'lg',
                })
              }
              title="عرض"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onEdit) {
                  onEdit(row.original.id)
                } else {
                  globalSheet.openOpponentForm({
                    mode: 'edit',
                    slug: currentSlug,
                    opponentId: row.original.id,
                    size: 'lg',
                  })
                }
              }}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row.original.id)}
                title="حذف"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      }),
    ],
    [onEdit, onDelete, organizationSlug]
  )

  const quickFilters = useMemo(
    () => [
      {
        key: 'opponentType',
        label: 'نوع الخصم',
        values: [
          { label: 'فرد', value: 'individual' },
          { label: 'شركة', value: 'company' },
          { label: 'مؤسسة', value: 'institution' },
          { label: 'منظمة', value: 'organization' },
          { label: 'حكومي', value: 'government' },
          { label: 'جمعية', value: 'association' },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = opponents

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'opponentType':
          filtered = filtered.filter((opponent) => opponent.opponentType === value)
          break
      }
    })

    return filtered
  }, [opponents, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const opponent = row.original
      const searchableText = [opponent.name, opponent.opponentType].filter(Boolean).join(' ').toLowerCase()

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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <OpponentAvatar opponent={row.original} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground truncate text-sm font-medium">{row.original.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 px-1 py-0 text-xs',
                  opponentTypeColors[row.original.opponentType as keyof typeof opponentTypeColors]
                )}
              >
                {opponentTypeLabels[row.original.opponentType as keyof typeof opponentTypeLabels]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mx-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() =>
              globalSheet.openOpponentDetails({
                slug: currentSlug,
                opponentId: row.original.id,
                size: 'lg',
              })
            }
            title="عرض"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="bg-border/30 h-px w-full" />
    </div>
  )

  const emptyStateAction = onCreateNew ? (
    <Button onClick={onCreateNew} className="mt-4">
      <Plus className="ml-1 h-4 w-4" />
      إضافة خصم جديد
    </Button>
  ) : null

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة خصم
    </Button>
  ) : null

  if (opponents.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Users className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">لا يوجد خصوم</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة خصم جديد لإدارة ملفاتك القانونية</p>
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
      searchPlaceholder="البحث عن خصم (الاسم، النوع...)"
      noDataMessage="لا يوجد خصوم مطابقين للبحث"
      mobileCardRenderer={mobileCardRenderer}
      showQuickFilters={true}
      quickFilters={quickFilters}
      activeFilters={activeFilters}
      onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
      headerActions={headerActions}
      emptyStateAction={emptyStateAction}
      enableVirtualScroll={true}
      virtualItemHeight={50}
      className="w-full"
    />
  )
}

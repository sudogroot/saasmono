'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import type { OpponentListItem } from '@/types'
import { orpc } from '@/utils/orpc'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  GenericTable,
  Heading,
  Text,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CalendarCheck, Edit, Eye, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EntityBadge } from '../base/entity-badge'

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
  const queryClient = useQueryClient()

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [deletingOpponentId, setDeletingOpponentId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.opponents.deleteOpponent.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف الخصم بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.opponents.listOpponents.key() })
        setDeletingOpponentId(null)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
    }),
  })

  const handleDelete = (opponentId: string) => {
    if (onDelete) {
      onDelete(opponentId)
    } else {
      setDeletingOpponentId(opponentId)
    }
  }

  const confirmDelete = () => {
    if (deletingOpponentId) {
      deleteMutation.mutate({ opponentId: deletingOpponentId })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'opponent',
        header: 'الخصم',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div>
              <div className="text-foreground font-medium">{row.original.name}</div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('opponentType', {
        id: 'type',
        header: 'النوع',
        cell: ({ getValue }) => <EntityBadge type="entityType" value={getValue()} />,
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: 'تاريخ الإضافة',
        cell: ({ getValue }) => (
          <div className="flex gap-2">
            <CalendarCheck className="h-4 w-4" />
            <Text size="xs">
              {new Date(getValue()).toLocaleDateString('ar-TN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation()
                    if (onView) {
                      onView(row.original.id)
                    } else {
                      globalSheet.openOpponentDetails({
                        slug: currentSlug,
                        opponentId: row.original.id,
                        size: 'md',
                      })
                    }
                  }}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation()
                    if (onEdit) {
                      onEdit(row.original.id)
                    } else {
                      globalSheet.openOpponentForm({
                        mode: 'edit',
                        slug: currentSlug,
                        opponentId: row.original.id,
                        size: 'md',
                      })
                    }
                  }}
                >
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation()
                    handleDelete(row.original.id)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          { label: <EntityBadge type="entityType" value="individual" />, value: 'individual' },
          { label: <EntityBadge type="entityType" value="company" />, value: 'company' },
          { label: <EntityBadge type="entityType" value="institution" />, value: 'institution' },
          { label: <EntityBadge type="entityType" value="organization" />, value: 'organization' },
          { label: <EntityBadge type="entityType" value="government" />, value: 'government' },
          { label: <EntityBadge type="entityType" value="association" />, value: 'association' },
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
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Text size="lg">{row.original.name}</Text>
              <EntityBadge
                type="entityType"
                value={row.original.opponentType}
                showIcon={false}
                className="shrink-0 px-1 py-0 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="mx-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(event) => {
              event.stopPropagation()
              globalSheet.openOpponentDetails({
                slug: currentSlug,
                opponentId: row.original.id,
                size: 'md',
              })
            }}
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
            <Heading level={3} className="font-semibold">
              لا يوجد خصوم
            </Heading>
            <Text variant="muted" className="mt-1">
              ابدأ بإضافة خصم جديد لإدارة ملفاتك القانونية
            </Text>
          </div>
          {emptyStateAction}
        </div>
      </div>
    )
  }

  return (
    <>
      <GenericTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => {
          if (onView) {
            onView(row.original.id)
          } else {
            globalSheet.openOpponentDetails({
              slug: currentSlug,
              opponentId: row.original.id,
              size: 'md',
            })
          }
        }}
        error={error}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        // searchPlaceholder="البحثصم (الاسم، النوع...)"
        noDataMessage="لا يوجد خصوم مطابقين للبحث"
        mobileCardRenderer={mobileCardRenderer}
        showQuickFilters={true}
        quickFilters={quickFilters as any}
        activeFilters={activeFilters}
        onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
        headerActions={headerActions}
        emptyStateAction={emptyStateAction}
        enableVirtualScroll={true}
        virtualItemHeight={60}
        className="w-full"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingOpponentId} onOpenChange={() => setDeletingOpponentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذا الخصم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

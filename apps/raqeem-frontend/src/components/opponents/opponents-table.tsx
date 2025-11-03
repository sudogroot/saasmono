'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import type { OpponentListItem } from '@/types'
import { orpc } from '@/utils/orpc'
import { getErrorMessage } from '@/utils/error-utils'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

  // Fetch deletion impact when dialog opens
  const { data: deletionImpact, isLoading: isLoadingImpact } = useQuery({
    ...orpc.opponents.getOpponentDeletionImpact.queryOptions({
      input: {
        opponentId: deletingOpponentId!,
      },
    }),
    enabled: !!deletingOpponentId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.opponents.deleteOpponent.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف الخصم بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.opponents.listOpponents.key() })
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases.key() })
        setDeletingOpponentId(null)
      },
      onError: (error: any) => {
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage)
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
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-foreground font-medium truncate">{row.original.name}</div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('opponentType', {
        id: 'type',
        header: 'النوع',
        enableSorting: true,
        cell: ({ getValue }) => <EntityBadge type="entityType" value={getValue()} />,
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: 'تاريخ الإضافة',
        enableSorting: true,
        sortingFn: 'datetime',
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
              <Text size="lg" truncate>{row.original.name}</Text>
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
            <AlertDialogTitle>تأكيد حذف الخصم</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {isLoadingImpact ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">جاري التحقق من البيانات المرتبطة...</div>
                </div>
              ) : deletionImpact ? (
                <>
                  <div className="font-medium text-foreground">
                    هل أنت متأكد من أنك تريد حذف هذا الخصم؟
                  </div>

                  {deletionImpact.casesCount > 0 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 space-y-3">
                      <div className="font-semibold text-warning text-sm">
                        ⚠️ تنبيه: سيتم إلغاء تعيين هذا الخصم من القضايا التالية:
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">• عدد القضايا: </span>
                        <span>{deletionImpact.casesCount} قضية</span>
                      </div>

                      {deletionImpact.cases.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-warning/20">
                          <div className="text-xs font-medium mb-1">القضايا المتأثرة:</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {deletionImpact.cases.map((caseItem) => (
                              <div key={caseItem.id} className="text-xs">
                                <span className="font-medium">{caseItem.caseNumber}</span> - {caseItem.caseTitle}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground italic">
                        ملاحظة: القضايا لن يتم حذفها، فقط سيتم إزالة الخصم منها.
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    لا يمكن التراجع عن هذا الإجراء.
                  </div>
                </>
              ) : (
                <div>هل أنت متأكد من أنك تريد حذف هذا الخصم؟</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending || isLoadingImpact}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

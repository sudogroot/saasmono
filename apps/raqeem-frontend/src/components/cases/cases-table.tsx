'use client'

import { globalSheet } from '@/stores/global-sheet-store'
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
  ValueText,
} from '@repo/ui'
// import type { Case } from '@/types'
import { orpc } from '@/utils/orpc'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CalendarCheck, Edit, Eye, FileText, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EntityBadge } from '../base/entity-badge'

interface CasesTableProps {
  // cases?: Case[]
  cases?: any
  isLoading?: boolean
  error?: Error | null
  onEdit?: (caseId: string) => void
  onDelete?: (caseId: string) => void
  onView?: (caseId: string) => void
  onCreateNew?: () => void
  organizationSlug?: string
  slug?: string
}

const columnHelper = createColumnHelper<any>() //Case

export function CasesTable({
  cases: propsCases,
  isLoading: propsIsLoading = false,
  error: propsError = null,
  onEdit,
  onDelete,
  onView,
  onCreateNew,
  organizationSlug,
  slug,
}: CasesTableProps) {
  const pathname = usePathname()
  const currentSlug = slug || pathname.split('/')[2] || ''
  const queryClient = useQueryClient()

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  // Use provided data or fetch from API
  const {
    data: fetchedCases = [],
    isLoading: fetchIsLoading,
    error: fetchError,
  } = useQuery({
    ...orpc.cases.listCases.queryOptions({
      input: { includeDeleted: false },
    }),
    enabled: !propsCases, // Only fetch if no cases provided
  })

  const cases = propsCases || fetchedCases
  const isLoading = propsIsLoading || fetchIsLoading
  const error = propsError || fetchError

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.cases.deleteCase.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف القضية بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases.key() })
        setDeletingCaseId(null)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
    }),
  })

  const handleDelete = (caseId: string) => {
    if (onDelete) {
      onDelete(caseId)
    } else {
      setDeletingCaseId(caseId)
    }
  }

  const confirmDelete = () => {
    if (deletingCaseId) {
      deleteMutation.mutate({ caseId: deletingCaseId })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('caseTitle', {
        id: 'case',
        header: 'القضية',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div>
              <div className="text-foreground font-medium">{row.original.caseTitle}</div>
              {row.original.caseSubject && (
                <div className="flex justify-items-center gap-2">
                  <Text variant="muted" size="xs">
                    {row.original.caseSubject}
                  </Text>
                </div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('caseStatus', {
        id: 'status',
        header: 'الحالة',
        cell: ({ getValue }) => <EntityBadge type="caseStatus" value={getValue()} />,
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        header: 'الأولوية',
        cell: ({ getValue }) => <EntityBadge type="priority" value={getValue()} />,
      }),
      columnHelper.display({
        id: 'client',
        header: 'العميل',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <ValueText fallbackText="غير محدد" className="text-sm" value={row.original.clientName} />
          </div>
        ),
      }),
      columnHelper.display({
        id: 'opponent',
        header: 'الخصم',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <ValueText fallbackText="غير محدد" className="text-sm" value={row.original.opponentName} />
          </div>
        ),
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
                      globalSheet.openCaseDetails({
                        slug: currentSlug,
                        caseId: row.original.id,
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
                      globalSheet.openCaseForm({
                        mode: 'edit',
                        slug: currentSlug,
                        caseId: row.original.id,
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
    [onEdit, onDelete, onView, currentSlug]
  )

  const quickFilters = useMemo(
    () => [
      {
        key: 'caseStatus',
        label: 'حالة القضية',
        values: [
          {
            label: <EntityBadge type="caseStatus" value="new" />,
            value: 'new',
          },
          {
            label: <EntityBadge type="caseStatus" value="under-review" />,
            value: 'under-review',
          },
          {
            label: <EntityBadge type="caseStatus" value="filed-to-court" />,
            value: 'filed-to-court',
          },
          {
            label: <EntityBadge type="caseStatus" value="under-consideration" />,
            value: 'under-consideration',
          },
          {
            label: <EntityBadge type="caseStatus" value="won" />,
            value: 'won',
          },
          {
            label: <EntityBadge type="caseStatus" value="lost" />,
            value: 'lost',
          },
          {
            label: <EntityBadge type="caseStatus" value="postponed" />,
            value: 'postponed',
          },
          {
            label: <EntityBadge type="caseStatus" value="closed" />,
            value: 'closed',
          },
          {
            label: <EntityBadge type="caseStatus" value="withdrawn" />,
            value: 'withdrawn',
          },
          {
            label: <EntityBadge type="caseStatus" value="suspended" />,
            value: 'suspended',
          },
        ],
      },
      {
        key: 'priority',
        label: 'الأولوية',
        values: [
          {
            label: <EntityBadge type="priority" value="low" />,
            value: 'low',
          },
          {
            label: <EntityBadge type="priority" value="normal" />,
            value: 'normal',
          },
          {
            label: <EntityBadge type="priority" value="medium" />,
            value: 'medium',
          },
          {
            label: <EntityBadge type="priority" value="high" />,
            value: 'high',
          },
          {
            label: <EntityBadge type="priority" value="urgent" />,
            value: 'urgent',
          },
          {
            label: <EntityBadge type="priority" value="critical" />,
            value: 'critical',
          },
        ],
      },
      {
        key: 'dateRange',
        label: 'الفترة الزمنية',
        values: [
          {
            label: 'آخر 7 أيام',
            value: '7days',
          },
          {
            label: 'آخر 30 يوم',
            value: '30days',
          },
          {
            label: 'آخر 3 أشهر',
            value: '3months',
          },
          {
            label: 'آخر 6 أشهر',
            value: '6months',
          },
          {
            label: 'آخر سنة',
            value: '1year',
          },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = cases

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'caseStatus':
          filtered = filtered.filter((case_: any) => case_.caseStatus === value)
          break
        case 'priority':
          filtered = filtered.filter((case_: any) => case_.priority === value)
          break
        case 'dateRange': {
          const now = new Date()
          let startDate: Date

          switch (value) {
            case '7days':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              break
            case '30days':
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              break
            case '3months':
              startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
              break
            case '6months':
              startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
              break
            case '1year':
              startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
              break
            default:
              return
          }

          filtered = filtered.filter((case_: any) => {
            if (!case_.createdAt) return false
            const caseDate = new Date(case_.createdAt)
            return caseDate >= startDate && caseDate <= now
          })
          break
        }
      }
    })

    return filtered
  }, [cases, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const case_ = row.original
      const searchableText = [
        case_.caseTitle,
        case_.caseNumber,
        case_.caseSubject,
        case_.caseStatus,
        case_.priority,
        case_.clientName,
        case_.opponentName,
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

  /**
   * Mobile card renderer for responsive design
   * Shows case info in a compact card format on mobile devices
   */
  const mobileCardRenderer = (row: any) => (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Text size="xl">{row.original.caseTitle}</Text>
              <EntityBadge
                type="caseStatus"
                value={row.original.caseStatus}
                showIcon={false}
                className="shrink-0 px-1 py-0 text-xs"
              />
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3">
              <Text variant="muted" size="base" className="font-mono">
                {row.original.caseNumber}
              </Text>
              <div className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                <Text size="base">{row.original.clientName}</Text>
              </div>
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
              if (onView) {
                onView(row.original.id)
              } else {
                globalSheet.openCaseDetails({
                  slug: currentSlug,
                  caseId: row.original.id,
                  size: 'md',
                })
              }
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
      إضافة قضية جديدة
    </Button>
  ) : null

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة قضية
    </Button>
  ) : null

  if (cases.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <FileText className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <Heading level={3} className="font-semibold">
              لا توجد قضايا
            </Heading>
            <Text variant="muted" className="mt-1">
              ابدأ بإضافة قضية جديدة لإدارة ملفاتك القانونية
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
            globalSheet.openCaseDetails({
              slug: currentSlug,
              caseId: row.original.id,
              size: 'md',
            })
          }
        }}
        error={error}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="البحث في القضايا (العنوان، الرقم، الموضوع، العميل، الخصم...)"
        noDataMessage="لا توجد قضايا مطابقة للبحث"
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
      <AlertDialog open={!!deletingCaseId} onOpenChange={() => setDeletingCaseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه القضية؟ لا يمكن التراجع عن هذا الإجراء.
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

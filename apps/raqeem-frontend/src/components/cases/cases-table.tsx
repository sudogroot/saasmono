'use client'

import { GenericTable } from '@/components/base/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui'
import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import type { Case } from '@/types'
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
import { Edit, Eye, FileText, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { casePriorityBadges, PriorityBadge } from '../base/badge'
import { CaseAvatar } from './case-avatar'

interface CasesTableProps {
  cases?: Case[]
  isLoading?: boolean
  error?: Error | null
  onEdit?: (caseId: string) => void
  onDelete?: (caseId: string) => void
  onView?: (caseId: string) => void
  onCreateNew?: () => void
  organizationSlug?: string
  slug?: string
}

const columnHelper = createColumnHelper<Case>()

const caseStatusColors = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  'under-review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'filed-to-court': 'bg-purple-50 text-purple-700 border-purple-200',
  'under-consideration': 'bg-orange-50 text-orange-700 border-orange-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  postponed: 'bg-gray-50 text-gray-700 border-gray-200',
  closed: 'bg-slate-50 text-slate-700 border-slate-200',
  withdrawn: 'bg-pink-50 text-pink-700 border-pink-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
} as const

const caseStatusLabels = {
  new: 'جديدة',
  'under-review': 'قيد المراجعة',
  'filed-to-court': 'مرفوعة للمحكمة',
  'under-consideration': 'قيد النظر',
  won: 'كسبت',
  lost: 'خسرت',
  postponed: 'مؤجلة',
  closed: 'مغلقة',
  withdrawn: 'منسحبة',
  suspended: 'معلقة',
} as const

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
    ...orpc.cases.list.queryOptions({
      input: { includeDeleted: false },
    }),
    enabled: !propsCases, // Only fetch if no cases provided
  })

  const cases = propsCases || fetchedCases
  const isLoading = propsIsLoading || fetchIsLoading
  const error = propsError || fetchError

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.cases.delete.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف القضية بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.cases.list.key() })
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
      deleteMutation.mutate({ id: deletingCaseId })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('caseTitle', {
        id: 'case',
        header: 'القضية',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CaseAvatar case_={row.original} size="md" />
            <div>
              <div className="text-foreground font-medium">{row.original.caseTitle}</div>
              <div className="text-muted-foreground font-mono text-sm">{row.original.caseNumber}</div>
              {row.original.caseSubject && (
                <div className="text-muted-foreground line-clamp-1 text-sm">{row.original.caseSubject}</div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('caseStatus', {
        id: 'status',
        header: 'الحالة',
        cell: ({ getValue }) => {
          const status = getValue() as keyof typeof caseStatusColors
          return (
            <Badge variant="outline" className={cn('font-medium', caseStatusColors[status])}>
              {caseStatusLabels[status]}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        header: 'الأولوية',
        cell: ({ getValue }) => {
          const priority = getValue()
          return <PriorityBadge priority={priority as any} />
        },
      }),
      columnHelper.display({
        id: 'client',
        header: 'العميل',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">{row.original.client?.name || 'غير محدد'}</span>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'opponent',
        header: 'الخصم',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">{row.original.opponent?.name || 'غير محدد'}</span>
          </div>
        ),
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
              onClick={() => {
                if (onView) {
                  onView(row.original.id)
                } else {
                  globalSheet.openCaseDetails({
                    slug: currentSlug,
                    caseId: row.original.id,
                    size: 'lg',
                  })
                }
              }}
              title="عرض"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (onEdit) {
                      onEdit(row.original.id)
                    } else {
                      globalSheet.openCaseForm({
                        mode: 'edit',
                        slug: currentSlug,
                        caseId: row.original.id,
                        size: 'lg',
                      })
                    }
                  }}
                >
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(row.original.id)}
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
          { label: 'جديدة', value: 'new' },
          { label: 'قيد المراجعة', value: 'under-review' },
          { label: 'مرفوعة للمحكمة', value: 'filed-to-court' },
          { label: 'قيد النظر', value: 'under-consideration' },
          { label: 'كسبت', value: 'won' },
          { label: 'خسرت', value: 'lost' },
          { label: 'مؤجلة', value: 'postponed' },
          { label: 'مغلقة', value: 'closed' },
          { label: 'منسحبة', value: 'withdrawn' },
          { label: 'معلقة', value: 'suspended' },
        ],
      },
      {
        key: 'priority',
        label: 'الأولوية',
        values: Object.keys(casePriorityBadges).map((priority) => ({
          label: priority,
          value: priority,
        })),
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
          filtered = filtered.filter((case_) => case_.caseStatus === value)
          break
        case 'priority':
          filtered = filtered.filter((case_) => case_.priority === value)
          break
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
        case_.client?.name,
        case_.opponent?.name,
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
          <CaseAvatar case_={row.original} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground truncate text-sm font-medium">{row.original.caseTitle}</span>
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 px-1 py-0 text-xs',
                  caseStatusColors[row.original.caseStatus as keyof typeof caseStatusColors]
                )}
              >
                {caseStatusLabels[row.original.caseStatus as keyof typeof caseStatusLabels]}
              </Badge>
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
              <span className="font-mono">{row.original.caseNumber}</span>
              <PriorityBadge priority={row.original.priority as any} size="sm" />
              {row.original.client?.name && (
                <div className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" />
                  <span className="max-w-[60px] truncate">{row.original.client.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mx-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (onView) {
                onView(row.original.id)
              } else {
                globalSheet.openCaseDetails({
                  slug: currentSlug,
                  caseId: row.original.id,
                  size: 'lg',
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
            <h3 className="text-lg font-semibold">لا توجد قضايا</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة قضية جديدة لإدارة ملفاتك القانونية</p>
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
        error={error}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="البحث في القضايا (العنوان، الرقم، الموضوع، العميل، الخصم...)"
        noDataMessage="لا توجد قضايا مطابقة للبحث"
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

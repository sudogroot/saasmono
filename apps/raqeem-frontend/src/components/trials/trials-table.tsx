'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  GenericTable,
  Heading,
  Text,
} from '@repo/ui'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import { getErrorMessage } from '@/utils/error-utils'
import { Calendar, Clock, Edit, Eye, Gavel, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react'
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, isPast, isFuture } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface TrialsTableProps {
  trials: any[]
  isLoading?: boolean
  error?: Error | null
  onEdit?: (trialId: string) => void
  onDelete?: (trialId: string) => void
  onView?: (trialId: string) => void
  onCreateNew?: () => void
  slug?: string
}

const columnHelper = createColumnHelper<any>()

// Time-based badge colors
const getTrialTimeBadge = (trialDateTime: Date) => {
  const now = new Date()
  const trialDate = new Date(trialDateTime)

  if (isPast(trialDate) && !isToday(trialDate)) {
    return { label: 'منتهية', className: 'bg-gray-100 text-gray-700 border-gray-200' }
  }

  if (isToday(trialDate)) {
    return { label: 'اليوم', className: 'bg-red-100 text-red-700 border-red-200' }
  }

  if (isTomorrow(trialDate)) {
    return { label: 'غداً', className: 'bg-orange-100 text-orange-700 border-orange-200' }
  }

  if (isThisWeek(trialDate)) {
    return { label: 'هذا الأسبوع', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  }

  if (isThisMonth(trialDate)) {
    return { label: 'هذا الشهر', className: 'bg-blue-100 text-blue-700 border-blue-200' }
  }

  return { label: 'قادمة', className: 'bg-green-100 text-green-700 border-green-200' }
}

export function TrialsTable({
  trials,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  onCreateNew,
  slug,
}: TrialsTableProps) {
  const pathname = usePathname()
  const currentSlug = slug || pathname.split('/')[2] || ''
  const queryClient = useQueryClient()

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [deletingTrialId, setDeletingTrialId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.trials.deleteTrial.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف الجلسة بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials.key() })
        setDeletingTrialId(null)
      },
      onError: (error: any) => {
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage)
      },
    }),
  })

  const handleDelete = (trialId: string) => {
    if (onDelete) {
      onDelete(trialId)
    } else {
      setDeletingTrialId(trialId)
    }
  }

  const confirmDelete = () => {
    if (deletingTrialId) {
      deleteMutation.mutate({ trialId: deletingTrialId })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('trialNumber', {
        id: 'trialNumber',
        header: 'رقم الجلسة',
        size: 100,
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full shrink-0">
              <span className="text-sm font-bold">#{getValue()}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('caseNumber', {
        id: 'case',
        header: 'القضية',
        size: 250,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[250px] overflow-hidden">
            <div className="text-foreground font-medium truncate">{row.original.caseNumber}</div>
            <div className="text-muted-foreground text-sm truncate">{row.original.caseTitle}</div>
          </div>
        ),
      }),
      columnHelper.accessor('clientName', {
        id: 'client',
        header: 'المنوب',
        size: 150,
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 min-w-0 max-w-[150px]">
            <Users className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="truncate">{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('courtName', {
        id: 'court',
        header: 'المحكمة',
        size: 150,
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 min-w-0 max-w-[150px]">
            <Gavel className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-sm truncate">{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('trialDateTime', {
        id: 'datetime',
        header: 'التاريخ والوقت',
        size: 180,
        cell: ({ getValue }) => {
          const date = new Date(getValue())
          const timeBadge = getTrialTimeBadge(date)

          return (
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{format(date, 'dd MMM yyyy', { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{format(date, 'hh:mm a', { locale: ar })}</span>
              </div>
              <Badge variant="outline" className={cn('text-xs', timeBadge.className)}>
                {timeBadge.label}
              </Badge>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'الإجراءات',
        size: 80,
        cell: ({ row }) => {
          const trial = row.original

          return (
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
                      globalSheet.openTrialDetails({
                        slug: currentSlug,
                        trialId: trial.id,
                        size: 'md',
                      })
                    }}
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    عرض
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation()
                      if (onEdit) {
                        onEdit(trial.id)
                      } else {
                        globalSheet.openTrialForm({
                          mode: 'edit',
                          slug: currentSlug,
                          trialId: trial.id,
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
                      handleDelete(trial.id)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [currentSlug, onDelete, onEdit]
  )

  const filterConfigs = useMemo(
    () => [
      {
        key: 'timeRange',
        label: 'الوقت',
        values: [
          { label: 'اليوم', value: 'today' },
          { label: 'غداً', value: 'tomorrow' },
          { label: 'هذا الأسبوع', value: 'this-week' },
          { label: 'هذا الشهر', value: 'this-month' },
          { label: 'الجلسات السابقة', value: 'past' },
          { label: 'الجلسات القادمة', value: 'future' },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = trials

    // Apply time range filter
    if (activeFilters.timeRange) {
      filtered = filtered.filter((trial) => {
        const trialDate = new Date(trial.trialDateTime)

        switch (activeFilters.timeRange) {
          case 'today':
            return isToday(trialDate)
          case 'tomorrow':
            return isTomorrow(trialDate)
          case 'this-week':
            return isThisWeek(trialDate)
          case 'this-month':
            return isThisMonth(trialDate)
          case 'past':
            return isPast(trialDate) && !isToday(trialDate)
          case 'future':
            return isFuture(trialDate) || isToday(trialDate)
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(
        (trial) =>
          trial.caseNumber?.toLowerCase().includes(searchLower) ||
          trial.caseTitle?.toLowerCase().includes(searchLower) ||
          trial.clientName?.toLowerCase().includes(searchLower) ||
          trial.courtName?.toLowerCase().includes(searchLower) ||
          trial.trialNumber?.toString().includes(searchLower)
      )
    }

    return filtered
  }, [trials, activeFilters, searchValue])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    initialState: {
      sorting: [{ id: 'datetime', desc: false }], // Sort by date ascending (upcoming first)
    },
  })

  const quickFilters = filterConfigs.map((config) => ({
    label: config.label,
    key: config.key,
    values: config.values.map((v) => ({ label: v.label, value: v.value })),
  }))

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة جلسة
    </Button>
  ) : null

  const emptyStateAction = onCreateNew ? (
    <Button onClick={onCreateNew} className="mt-4">
      <Plus className="ml-1 h-4 w-4" />
      إضافة جلسة جديدة
    </Button>
  ) : null

  const mobileCardRenderer = (row: any) => {
    const trial = row.original
    const trialDate = new Date(trial.trialDateTime)
    const timeBadge = getTrialTimeBadge(trialDate)

    return (
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <span className="text-sm font-bold">#{trial.trialNumber}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground truncate font-medium">{trial.caseNumber}</span>
                <Badge variant="outline" className={cn('shrink-0 px-1.5 py-0 text-xs', timeBadge.className)}>
                  {timeBadge.label}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">{trial.caseTitle}</div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(trialDate, 'dd/MM/yyyy', { locale: ar })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(trialDate, 'hh:mm a', { locale: ar })}</span>
                </div>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                <Gavel className="h-3 w-3" />
                <span className="truncate">{trial.courtName}</span>
              </div>
            </div>
          </div>

          <div className="mx-2">
            <Eye className="text-muted-foreground h-4 w-4" />
          </div>
        </div>
        <div className="bg-border/30 h-px w-full" />
      </div>
    )
  }

  if (trials.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Calendar className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <Heading level={3} className="font-semibold">لا توجد جلسات</Heading>
            <Text variant="muted" className="mt-1">ابدأ بإضافة جلسة جديدة لإدارة مواعيد المحاكمات</Text>
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
        onRowClick={(row) => {
          globalSheet.openTrialDetails({
            slug: currentSlug,
            trialId: row.original.id,
            size: 'md',
          })
        }}
        searchPlaceholder="البحث عن جلسة (رقم، قضية، منوب، محكمة...)"
        noDataMessage="لا توجد جلسات مطابقة للبحث"
        showQuickFilters={true}
        quickFilters={quickFilters as any}
        activeFilters={activeFilters}
        onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
        headerActions={headerActions}
        emptyStateAction={emptyStateAction}
        mobileCardRenderer={mobileCardRenderer}
        enableVirtualScroll={true}
        virtualItemHeight={90}
        className="w-full"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTrialId} onOpenChange={() => setDeletingTrialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.
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
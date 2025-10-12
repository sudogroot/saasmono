'use client'

import { globalSheet } from '@/stores/global-sheet-store'
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
import { CalendarCheck, Edit, Eye, Mail, MoreHorizontal, Phone, Plus, Trash2, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EntityBadge } from '../base/entity-badge'

// Client type is now imported from shared types

interface ClientsTableProps {
  clients: any[] // client type
  isLoading?: boolean
  error?: Error | null
  onEdit?: (clientId: string) => void
  onDelete?: (clientId: string) => void
  onView?: (clientId: string) => void
  onCreateNew?: () => void
  organizationSlug?: string
  slug?: string
}

const columnHelper = createColumnHelper<any>() // Client type

export function ClientsTable({
  clients,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  onCreateNew,
  organizationSlug,
  slug,
}: ClientsTableProps) {
  const pathname = usePathname()
  const currentSlug = slug || pathname.split('/')[2] || ''
  const queryClient = useQueryClient()

  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.clients.deleteClient.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف العميل بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })
        setDeletingClientId(null)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
    }),
  })

  const handleDelete = (clientId: string) => {
    if (onDelete) {
      onDelete(clientId)
    } else {
      setDeletingClientId(clientId)
    }
  }

  const confirmDelete = () => {
    if (deletingClientId) {
      deleteMutation.mutate({ clientId: deletingClientId })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'client',
        header: 'العميل',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div>
              <div className="text-foreground font-medium">{row.original.name}</div>
              {row.original.nationalId && (
                <div className="flex justify-items-center gap-2">
                  <Text variant="muted" size="xs">
                    الهوية: {row.original.nationalId}
                  </Text>
                </div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('clientType', {
        id: 'type',
        header: 'النوع',
        cell: ({ getValue }) => <EntityBadge type="entityType" value={getValue()} />,
      }),
      columnHelper.display({
        id: 'contact',
        header: 'معلومات الاتصال',
        cell: ({ row }) => (
          <div className="space-y-1">
            {row.original.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="text-muted-foreground h-3 w-3" />
                <span className="font-mono">{row.original.phone}</span>
              </div>
            )}
            {row.original.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="text-muted-foreground h-3 w-3" />
                <span className="max-w-[150px] truncate">{row.original.email}</span>
              </div>
            )}
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
                    globalSheet.openClientDetails({
                      slug: currentSlug,
                      clientId: row.original.id,
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
                      onEdit(row.original.id)
                    } else {
                      globalSheet.openClientForm({
                        mode: 'edit',
                        slug: currentSlug,
                        clientId: row.original.id,
                        size: 'md',
                        initialData: row.original,
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
        key: 'clientType',
        label: 'نوع العميل',
        values: [
          {
            label: <EntityBadge type="entityType" value="individual" />,
            value: 'individual',
          },
          {
            label: <EntityBadge type="entityType" value="company" />,
            value: 'company',
          },
          {
            label: <EntityBadge type="entityType" value="institution" />,
            value: 'institution',
          },
          {
            label: <EntityBadge type="entityType" value="organization" />,
            value: 'organization',
          },
          {
            label: <EntityBadge type="entityType" value="government" />,
            value: 'government',
          },
          {
            label: <EntityBadge type="entityType" value="association" />,
            value: 'association',
          },
        ],
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    let filtered = clients

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'clientType':
          filtered = filtered.filter((client) => client.clientType === value)
          break
      }
    })

    return filtered
  }, [clients, activeFilters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const client = row.original
      const searchableText = [client.name, client.nationalId, client.clientType, client.phone, client.email]
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Text size="lg" truncate>
                {row.original.name}
              </Text>
              <EntityBadge
                type="entityType"
                value={row.original.clientType}
                showIcon={false}
                className="shrink-0 px-1 py-0 text-xs"
              />
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
              {row.original.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5" />
                  <Text variant="muted" size="base">
                    {row.original.phone}
                  </Text>
                </div>
              )}
              {row.original.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5" />
                  <Text size="base">{row.original.email}</Text>
                </div>
              )}
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
              globalSheet.openClientDetails({
                slug: currentSlug,
                clientId: row.original.id,
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
      إضافة عميل جديد
    </Button>
  ) : null

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className="ml-1 h-4 w-4" />
      إضافة عميل
    </Button>
  ) : null

  if (clients.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Users className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <Heading level={3} className="font-semibold">
              لا يوجد عملاء
            </Heading>
            <Text variant="muted" className="mt-1">
              ابدأ بإضافة عميل جديد لإدارة ملفاتك القانونية
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
          globalSheet.openClientDetails({
            slug: currentSlug,
            clientId: row.original.id,
            size: 'md',
          })
        }}
        error={error}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        // searchPlaceholder="البحث عن عميل (الاسم، الهوية، الهاتف، البريد الإلكتروني...)"
        noDataMessage="لا يوجد عملاء مطابقين للبحث"
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
      <AlertDialog open={!!deletingClientId} onOpenChange={() => setDeletingClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
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

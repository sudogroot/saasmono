'use client'

import { Badge, Button, GenericTable } from '@repo/ui'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
// import type { Client } from '@/types';
import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import { Edit, Eye, Mail, Phone, Plus, Trash2, Users } from 'lucide-react'
import { ClientAvatar } from './client-avatar'
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
  const [searchValue, setSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'client',
        header: 'العميل',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ClientAvatar client={row.original} size="md" />
            <div>
              <div className="text-foreground font-medium">{row.original.name}</div>
              {row.original.nationalId && (
                <div className="text-muted-foreground text-sm">الهوية: {row.original.nationalId}</div>
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
              onClick={(e) => {
                e.stopPropagation()
                console.log('View button clicked:', row.original.id)
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
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
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
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(row.original.id)
                }}
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
          <ClientAvatar client={row.original} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground truncate text-lg font-medium md:text-sm">{row.original.name}</span>
              <EntityBadge type="entityType" value={row.original.clientType} showIcon={false} className="shrink-0 px-1 py-0 text-base md:text-xs" />
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-sm md:text-xs">
              {row.original.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5" />
                  <span className="font-mono">{row.original.phone}</span>
                </div>
              )}
              {row.original.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5" />
                  <span className="text-sm md:text-xs">{row.original.email}</span>
                </div>
              )}
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
            <h3 className="text-lg font-semibold">لا يوجد عملاء</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة عميل جديد لإدارة ملفاتك القانونية</p>
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
      onRowClick={(row) => {
        console.log('Row clicked:', row.original)
        console.log('Current slug:', currentSlug)
        globalSheet.openClientDetails({
          slug: currentSlug,
          clientId: row.original.id,
          size: 'md',
        })
      }}
      searchPlaceholder="البحث عن عميل (الاسم، الهوية، الهاتف، البريد الإلكتروني...)"
      noDataMessage="لا يوجد عملاء مطابقين للبحث"
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

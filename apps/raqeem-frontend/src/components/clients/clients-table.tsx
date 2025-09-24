'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { GenericTable } from '@/components/base/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Client } from '@/types';
import { ClientAvatar } from './client-avatar';
import { Phone, Mail, Eye, Edit, Trash2, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { globalSheet } from '@/stores/global-sheet-store';
import { cn } from '@/lib/utils';

// Client type is now imported from shared types

interface ClientsTableProps {
  clients: Client[];
  isLoading?: boolean;
  error?: Error | null;
  onEdit?: (clientId: string) => void;
  onDelete?: (clientId: string) => void;
  onView?: (clientId: string) => void;
  onCreateNew?: () => void;
  organizationSlug?: string;
  slug?: string;
}

const columnHelper = createColumnHelper<Client>();

const clientTypeColors = {
  individual: 'bg-blue-50 text-blue-700 border-blue-200',
  company: 'bg-green-50 text-green-700 border-green-200',
  institution: 'bg-purple-50 text-purple-700 border-purple-200',
  organization: 'bg-orange-50 text-orange-700 border-orange-200',
  government: 'bg-gray-50 text-gray-700 border-gray-200',
  association: 'bg-indigo-50 text-indigo-700 border-indigo-200',
} as const;

const clientTypeLabels = {
  individual: 'فرد',
  company: 'شركة',
  institution: 'مؤسسة',
  organization: 'منظمة',
  government: 'حكومي',
  association: 'جمعية',
} as const;

export function ClientsTable({
  clients,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  onView,
  onCreateNew,
  organizationSlug,
  slug,
}: ClientsTableProps) {
  const pathname = usePathname();
  const currentSlug = slug || pathname.split('/')[2] || '';
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'client',
        header: 'العميل',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <ClientAvatar client={row.original} size='md' />
            <div>
              <div className='font-medium text-foreground'>{row.original.name}</div>
              {row.original.nationalId && (
                <div className='text-sm text-muted-foreground'>
                  الهوية: {row.original.nationalId}
                </div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('clientType', {
        id: 'type',
        header: 'النوع',
        cell: ({ getValue }) => {
          const clientType = getValue() as keyof typeof clientTypeColors;
          return (
            <Badge variant='outline' className={cn('font-medium', clientTypeColors[clientType])}>
              {clientTypeLabels[clientType]}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'contact',
        header: 'معلومات الاتصال',
        cell: ({ row }) => (
          <div className='space-y-1'>
            {row.original.phone && (
              <div className='flex items-center gap-2 text-sm'>
                <Phone className='h-3 w-3 text-muted-foreground' />
                <span className='font-mono'>{row.original.phone}</span>
              </div>
            )}
            {row.original.email && (
              <div className='flex items-center gap-2 text-sm'>
                <Mail className='h-3 w-3 text-muted-foreground' />
                <span className='truncate max-w-[150px]'>{row.original.email}</span>
              </div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: 'تاريخ الإضافة',
        cell: ({ getValue }) => (
          <div className='text-sm text-muted-foreground'>
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
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                globalSheet.openClientDetails({
                  slug: currentSlug,
                  clientId: row.original.id,
                  size: 'lg',
                })
              }
              title='عرض'
            >
              <Eye className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                if (onEdit) {
                  onEdit(row.original.id);
                } else {
                  globalSheet.openClientForm({
                    mode: 'edit',
                    slug: currentSlug,
                    clientId: row.original.id,
                    size: 'lg',
                  });
                }
              }}
              title='تعديل'
            >
              <Edit className='h-4 w-4' />
            </Button>
            {onDelete && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onDelete(row.original.id)}
                title='حذف'
                className='text-destructive hover:text-destructive'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            )}
          </div>
        ),
      }),
    ],
    [onEdit, onDelete, organizationSlug]
  );

  const quickFilters = useMemo(
    () => [
      {
        key: 'clientType',
        label: 'نوع العميل',
        values: [
          { label: 'فرد', value: 'individual' },
          { label: 'شركة', value: 'company' },
          { label: 'مؤسسة', value: 'institution' },
          { label: 'منظمة', value: 'organization' },
          { label: 'حكومي', value: 'government' },
          { label: 'جمعية', value: 'association' },
        ],
      },
      {
        key: 'hasPhone',
        label: 'رقم الهاتف',
        values: [
          { label: 'يوجد رقم هاتف', value: 'true' },
          { label: 'لا يوجد رقم هاتف', value: 'false' },
        ],
      },
      {
        key: 'hasEmail',
        label: 'البريد الإلكتروني',
        values: [
          { label: 'يوجد بريد إلكتروني', value: 'true' },
          { label: 'لا يوجد بريد إلكتروني', value: 'false' },
        ],
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    let filtered = clients;

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return;

      switch (key) {
        case 'clientType':
          filtered = filtered.filter(client => client.clientType === value);
          break;
        case 'hasPhone':
          const hasPhone = value === 'true';
          filtered = filtered.filter(client => (hasPhone ? !!client.phone : !client.phone));
          break;
        case 'hasEmail':
          const hasEmail = value === 'true';
          filtered = filtered.filter(client => (hasEmail ? !!client.email : !client.email));
          break;
      }
    });

    return filtered;
  }, [clients, activeFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const client = row.original;
      const searchableText = [
        client.name,
        client.nationalId,
        client.clientType,
        client.phone,
        client.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(filterValue.toLowerCase());
    },
    state: {
      globalFilter: searchValue,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const mobileCardRenderer = (row: any) => (
    <div className='w-full'>
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <ClientAvatar client={row.original} size='sm' />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-foreground truncate'>
                {row.original.name}
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs px-1 py-0 shrink-0',
                  clientTypeColors[row.original.clientType as keyof typeof clientTypeColors]
                )}
              >
                {clientTypeLabels[row.original.clientType as keyof typeof clientTypeLabels]}
              </Badge>
            </div>
            <div className='flex items-center gap-3 text-xs text-muted-foreground mt-0.5'>
              {row.original.phone && (
                <div className='flex items-center gap-1'>
                  <Phone className='h-2.5 w-2.5' />
                  <span className='font-mono'>{row.original.phone}</span>
                </div>
              )}
              {row.original.email && (
                <div className='flex items-center gap-1'>
                  <Mail className='h-2.5 w-2.5' />
                  <span className=''>{row.original.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='mx-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() =>
              globalSheet.openClientDetails({
                slug: currentSlug,
                clientId: row.original.id,
                size: 'lg',
              })
            }
            title='عرض'
          >
            <Eye className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div className='w-full h-px bg-border/30' />
    </div>
  );

  const emptyStateAction = onCreateNew ? (
    <Button onClick={onCreateNew} className='mt-4'>
      <Plus className='h-4 w-4 ml-1' />
      إضافة عميل جديد
    </Button>
  ) : null;

  const headerActions = onCreateNew ? (
    <Button onClick={onCreateNew}>
      <Plus className='h-4 w-4 ml-1' />
      إضافة عميل
    </Button>
  ) : null;

  if (clients.length === 0 && !isLoading) {
    return (
      <div className='min-h-[400px] flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center'>
            <Users className='h-8 w-8 text-muted-foreground' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>لا يوجد عملاء</h3>
            <p className='text-muted-foreground mt-1'>
              ابدأ بإضافة عميل جديد لإدارة ملفاتك القانونية
            </p>
          </div>
          {emptyStateAction}
        </div>
      </div>
    );
  }

  return (
    <GenericTable
      table={table}
      isLoading={isLoading}
      error={error}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='البحث عن عميل (الاسم، الهوية، الهاتف، البريد الإلكتروني...)'
      noDataMessage='لا يوجد عملاء مطابقين للبحث'
      mobileCardRenderer={mobileCardRenderer}
      showQuickFilters={true}
      quickFilters={quickFilters}
      activeFilters={activeFilters}
      onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
      headerActions={headerActions}
      emptyStateAction={emptyStateAction}
      enableVirtualScroll={true}
      virtualItemHeight={50}
      className='w-full'
    />
  );
}

import { type Table as ReactTable, type Row } from "@tanstack/react-table";
import React from "react";

export interface FilterOption {
  label: string | React.ReactNode;
  value: string;
}

export interface QuickFilter {
  key: string;
  label: string;
  values: FilterOption[];
}

export interface GenericTableProps<TData> {
  table: ReactTable<TData>;
  dir?: "rtl" | "ltr";
  isLoading?: boolean;
  error?: Error | null;
  loadingMessage?: string;
  errorMessage?: string;
  noDataMessage?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showPagination?: boolean;
  isSelectable?: boolean;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRowClick?: (row: Row<TData>) => void;
  mobileCardRenderer?: (row: Row<TData>) => React.ReactNode;
  enableVirtualScroll?: boolean;
  virtualItemHeight?: number;
  containerHeight?: number;
  showQuickFilters?: boolean;
  quickFilters?: QuickFilter[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  tableTitle?: string;
  headerActions?: React.ReactNode;
  emptyStateAction?: React.ReactNode;
  // Infinite scroll props
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export interface TablePaginationProps<TData> {
  table: ReactTable<TData>;
  isSelectable?: boolean;
}

export interface MobileTableProps<TData> extends GenericTableProps<TData> {
  // Mobile-specific props can be added here
}

export interface DesktopTableProps<TData> extends GenericTableProps<TData> {
  // Desktop-specific props can be added here
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quickFilters: QuickFilter[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

export interface FilterChipsProps {
  quickFilters: QuickFilter[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

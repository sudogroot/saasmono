"use client";

import React from "react";
import { flexRender } from "@tanstack/react-table";
import { Checkbox } from "../../ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Separator } from "../../ui/separator";
import { cn } from "../../../lib/utils";
import type { DesktopTableProps } from "./types";
import { DesktopFilters } from "./desktop-filters";
import { TablePagination } from "./pagination";

export function DesktopTable<TData>({
  table,
  isLoading = false,
  error = null,
  dir = "rtl",
  loadingMessage = "جاري التحميل...",
  errorMessage,
  noDataMessage = "لا توجد بيانات",
  showSearch = true,
  searchPlaceholder = "البحث...",
  showPagination = true,
  isSelectable = false,
  className = "",
  searchValue = "",
  onSearchChange,
  onRowClick,
  showQuickFilters = false,
  quickFilters = [],
  activeFilters = {},
  onFilterChange,
  tableTitle,
  headerActions,
  emptyStateAction,
}: DesktopTableProps<TData>) {
  const columns = table.getAllColumns();
  const totalColumns = columns.length + (isSelectable ? 1 : 0);

  if (isLoading && table.getRowModel().rows.length === 0) {
    return (
      <div
        dir={dir || "rtl"}
        className={cn("flex items-center justify-center py-12", className)}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-destructive",
          className,
        )}
        dir={dir || "rtl"}
      >
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">حدث خطأ</div>
          <div className="text-sm">{errorMessage || error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)} dir={dir || "rtl"}>
      {(tableTitle || headerActions) && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {tableTitle && (
              <h2 className="text-2xl font-semibold">{tableTitle}</h2>
            )}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {(showSearch || showQuickFilters) && (
        <DesktopFilters
          showSearch={showSearch}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          showQuickFilters={showQuickFilters}
          quickFilters={quickFilters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
        />
      )}

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table dir={dir || "rtl"}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {isSelectable && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          table.getIsAllPageRowsSelected() ||
                          (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) =>
                          table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="تحديد الكل"
                      />
                    </TableHead>
                  )}
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50 transition-colors",
                      row.getIsSelected() && "bg-muted/50",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {isSelectable && (
                      <TableCell>
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="تحديد الصف"
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={totalColumns}
                    className="h-24 text-center"
                  >
                    <div className="space-y-4">
                      <div className="text-muted-foreground">
                        {noDataMessage}
                      </div>
                      {emptyStateAction}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <>
            <Separator className="my-0 px-0" />
            <div className="mx-2">
              <TablePagination table={table} isSelectable={isSelectable} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

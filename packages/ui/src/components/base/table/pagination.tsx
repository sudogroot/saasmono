"use client";

import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { TablePaginationProps } from "./types";

export function TablePagination<TData>({
  table,
  isSelectable = false,
}: TablePaginationProps<TData>) {
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalFilteredRows = table.getFilteredRowModel().rows.length;
  const currentPageRows = table.getRowModel().rows.length;

  return (
    <div className="flex flex-col space-y-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-2">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          عرض {currentPageRows} من {totalFilteredRows} صف
        </div>
        {isSelectable && selectedRowsCount > 0 && (
          <div className="text-sm text-muted-foreground">
            تم تحديد {selectedRowsCount} من {totalFilteredRows} صف
          </div>
        )}
        <div className="flex items-center space-x-2">
          <p className="text-sm">عرض</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            صفحة {table.getState().pagination.pageIndex + 1} من{" "}
            {table.getPageCount()}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="الذهاب للصفحة الأولى"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="الصفحة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="الصفحة التالية"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="الذهاب للصفحة الأخيرة"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useRef, useCallback } from "react";
import { Input } from "../../ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { MobileTableProps } from "./types";

export function MobileTable<TData>({
  table,
  isLoading = false,
  error = null,
  loadingMessage = "جاري التحميل...",
  errorMessage,
  noDataMessage = "لا توجد بيانات",
  showSearch = true,
  searchPlaceholder = "البحث...",
  className = "",
  searchValue = "",
  onSearchChange,
  mobileCardRenderer,
  enableVirtualScroll = true,
  virtualItemHeight = 72,
  tableTitle,
  headerActions,
  emptyStateAction,
  // Infinite scroll props
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: MobileTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rows = table.getFilteredRowModel().rows;

  // Fetch more data when scrolling near bottom
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement && hasNextPage && !isFetchingNextPage && fetchNextPage) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        // Fetch more when within 300px of bottom
        if (scrollHeight - scrollTop - clientHeight < 300) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetchingNextPage, hasNextPage]
  );

  // Set up virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => virtualItemHeight,
    // Enable dynamic height measurement for better UX
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      fetchMoreOnBottomReached(e.currentTarget);
    },
    [fetchMoreOnBottomReached]
  );

  // Check if we need to fetch more on mount/data change
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  if (isLoading && rows.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center py-12 text-destructive", className)}>
        <div className="text-center">
          <div className="text-sm font-medium mb-1">حدث خطأ</div>
          <div className="text-xs text-muted-foreground">{errorMessage || error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/50">
        {tableTitle && (
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-foreground">{tableTitle}</h1>
            {headerActions}
          </div>
        )}

        {showSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-0 rounded-lg text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background"
              />
            </div>
          </div>
        )}
      </div>

      {/* Virtualized List */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto -webkit-overflow-scrolling-touch"
        onScroll={enableVirtualScroll ? handleScroll : undefined}
        style={{
          height: "100%",
        }}
      >
        {rows.length > 0 ? (
          enableVirtualScroll ? (
            // Virtualized rendering
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;

                return (
                  <div
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="border-b border-border/20">
                      {mobileCardRenderer ? (
                        mobileCardRenderer(row)
                      ) : (
                        <div className="px-4 py-3">
                          <div className="text-sm text-foreground">
                            Item {virtualRow.index + 1}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Non-virtualized rendering
            <div>
              {rows.map((row) => (
                <div key={row.id} className="border-b border-border/20 last:border-b-0">
                  {mobileCardRenderer ? (
                    mobileCardRenderer(row)
                  ) : (
                    <div className="px-4 py-3">
                      <div className="text-sm text-foreground">Item {row.index + 1}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center space-y-3">
              <div className="text-sm text-muted-foreground">{noDataMessage}</div>
              {emptyStateAction}
            </div>
          </div>
        )}

        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-muted-foreground">جاري تحميل المزيد...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

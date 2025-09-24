"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { Input } from "@repo/ui";
import { Button } from "@repo/ui";
import { Checkbox } from "@repo/ui";
import { Search, Loader2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MobileTableProps } from "./types";
import { FilterDrawer } from "./filter-drawer";
import { FilterChips } from "./filter-chips";

export function MobileTable<TData>({
  table,
  isLoading = false,
  error = null,
  loadingMessage = "جاري التحميل...",
  errorMessage,
  noDataMessage = "لا توجد بيانات",
  showSearch = true,
  searchPlaceholder = "البحث...",
  isSelectable = false,
  className = "",
  searchValue = "",
  onSearchChange,
  mobileCardRenderer,
  enableVirtualScroll = true,
  virtualItemHeight = 50,
  containerHeight = 600,
  showQuickFilters = false,
  quickFilters = [],
  activeFilters = {},
  onFilterChange,
  enablePullToRefresh = false,
  onRefresh,
  tableTitle,
  headerActions,
  emptyStateAction,
}: MobileTableProps<TData>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });
  const [dynamicHeight, setDynamicHeight] = useState(containerHeight);
  
  const pullStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualScrollRef = useRef<HTMLDivElement>(null);

  // For mobile, use all filtered rows (no pagination)
  const rows = table.getFilteredRowModel().rows;

  const visibleStartIndex = Math.floor(scrollTop / virtualItemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerSize.height / virtualItemHeight) + 1,
    rows.length
  );
  const visibleRows = enableVirtualScroll
    ? rows.slice(visibleStartIndex, visibleEndIndex)
    : rows;

  const totalHeight = rows.length * virtualItemHeight;
  const offsetY = visibleStartIndex * virtualItemHeight;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (enablePullToRefresh && containerRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }, [enablePullToRefresh]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (enablePullToRefresh && pullStartY.current > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, (currentY - pullStartY.current) * 0.5);
      setPullDistance(Math.min(distance, 80));

      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [enablePullToRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (enablePullToRefresh && pullDistance > 60 && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    pullStartY.current = 0;
  }, [enablePullToRefresh, pullDistance, onRefresh]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleClearAllFilters = () => {
    quickFilters.forEach(filter => onFilterChange?.(filter.key, ""));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Set dynamic height based on viewport
  useEffect(() => {
    const setHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 200; // Approximate header + search height
      const bottomNavHeight = 80; // Mobile bottom nav height
      const calculatedHeight = viewportHeight - headerHeight - bottomNavHeight;
      setDynamicHeight(Math.max(calculatedHeight, 400)); // Minimum height of 400px
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  useEffect(() => {
    if (!enableVirtualScroll || !virtualScrollRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });

    resizeObserver.observe(virtualScrollRef.current);
    return () => resizeObserver.disconnect();
  }, [enableVirtualScroll]);

  if (isLoading && rows.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center py-12 text-destructive", className)}>
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">حدث خطأ</div>
          <div className="text-sm">{errorMessage || error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className={cn("w-full", className)}>
        {enablePullToRefresh && pullDistance > 0 && (
          <div
            className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b"
            style={{ transform: `translateY(${Math.min(pullDistance - 60, 20)}px)` }}
          >
            <div className="flex items-center justify-center py-4">
              <Loader2 className={cn("h-5 w-5", isRefreshing ? "animate-spin" : "")} />
              <span className="mr-2 text-sm">
                {isRefreshing ? "جاري التحديث..." : pullDistance > 60 ? "اتركه للتحديث" : "اسحب للتحديث"}
              </span>
            </div>
          </div>
        )}

        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="p-4 space-y-4">
            {tableTitle && (
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">{tableTitle}</h1>
                {headerActions}
              </div>
            )}

            {showSearch && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 h-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-offset-1"
                  />
                  {showQuickFilters && quickFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(true)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {showQuickFilters && (
                  <FilterChips
                    quickFilters={quickFilters}
                    activeFilters={activeFilters}
                    onFilterChange={onFilterChange || (() => {})}
                    onClearAll={handleClearAllFilters}
                  />
                )}
              </div>
            )}

            {isSelectable && table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium">
                  تم تحديد {table.getFilteredSelectedRowModel().rows.length} عنصر
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          ref={virtualScrollRef}
          className="pb-4"
          style={{ height: enableVirtualScroll ? dynamicHeight : 'auto' }}
          onScroll={enableVirtualScroll ? handleScroll : undefined}
        >
          {visibleRows.length > 0 ? (
            <div style={{ height: enableVirtualScroll ? totalHeight : 'auto', position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleRows.map((row) => (
                  <div
                    key={row.id}
                    style={{ height: enableVirtualScroll ? virtualItemHeight : 'auto' }}
                  >
                    {mobileCardRenderer ? (
                      <div className="relative">
                        {isSelectable && (
                          <div className="absolute top-4 right-4 z-10">
                            <Checkbox
                              checked={row.getIsSelected()}
                              onCheckedChange={(value) => row.toggleSelected(!!value)}
                              aria-label="تحديد الصف"
                              className="h-5 w-5"
                            />
                          </div>
                        )}
                        {mobileCardRenderer(row)}
                      </div>
                    ) : (
                      <div className="px-4 py-2 border-b border-border/30">
                        <div className="text-sm">Row {row.index + 1}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-lg text-muted-foreground mb-4">{noDataMessage}</div>
                {emptyStateAction}
              </div>
            </div>
          )}
        </div>
      </div>

      {showQuickFilters && (
        <FilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          quickFilters={quickFilters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange || (() => {})}
          onClearAll={handleClearAllFilters}
        />
      )}
    </>
  );
}
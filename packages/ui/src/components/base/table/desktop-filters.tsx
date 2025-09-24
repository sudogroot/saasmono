"use client";

import { Input } from "../../ui/input";
import { Search } from "lucide-react";
import { FilterChips } from "./filter-chips";
import { FilterSelect } from "./filter-select";
import type { QuickFilter } from "./types";

interface DesktopFiltersProps {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showQuickFilters?: boolean;
  quickFilters?: QuickFilter[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}

export function DesktopFilters({
  showSearch,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "البحث...",
  showQuickFilters,
  quickFilters = [],
  activeFilters = {},
  onFilterChange,
}: DesktopFiltersProps) {
  const handleClearAll = () => {
    quickFilters.forEach(filter => onFilterChange?.(filter.key, ""));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {showQuickFilters && quickFilters.length > 0 && (
          <div className="flex items-center gap-2">
            {quickFilters.map((filter) => (
              <FilterSelect
                key={filter.key}
                filterId={`desktop-${filter.key}`}
                filterKey={filter.key}
                label={filter.label}
                options={filter.values}
                value={activeFilters[filter.key] || ""}
                onValueChange={onFilterChange || (() => {})}
                placeholder={filter.label}
                showLabel={false}
                triggerClassName="w-[180px]"
              />
            ))}
          </div>
        )}
      </div>

      {showQuickFilters && (
        <FilterChips
          quickFilters={quickFilters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange || (() => {})}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
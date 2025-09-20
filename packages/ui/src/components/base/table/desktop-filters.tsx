"use client";

import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Search } from "lucide-react";
import { FilterChips } from "./filter-chips";

interface DesktopFiltersProps {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showQuickFilters?: boolean;
  quickFilters?: Array<{
    key: string;
    label: string;
    values: Array<{ label: string; value: string }>;
  }>;
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
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || "__all__"}
                onValueChange={(value) => onFilterChange?.(filter.key, value === "__all__" ? "" : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">جميع {filter.label}</SelectItem>
                  {filter.values.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { FilterChipsProps } from "./types";

export function FilterChips({
  quickFilters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterChipsProps) {
  const activeFilterEntries = Object.entries(activeFilters).filter(([_, value]) => value);

  if (activeFilterEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilterEntries.map(([key, value]) => {
        const filter = quickFilters.find(f => f.key === key);
        const filterValue = filter?.values.find(v => v.value === value);

        return (
          <Badge key={key} variant="secondary" className="flex items-center gap-1">
            {filter?.label}: {filterValue?.label || value}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => onFilterChange(key, "")}
            />
          </Badge>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs"
      >
        مسح الكل
      </Button>
    </div>
  );
}
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Label } from "../../ui/label";
import React from "react";

export interface FilterOption {
  label: string | React.ReactNode;
  value: string;
}

export interface FilterSelectProps {
  filterId: string;
  filterKey: string;
  label: string;
  options: FilterOption[];
  value: string;
  onValueChange: (key: string, value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
  showLabel?: boolean;
  triggerClassName?: string;
}

export function FilterSelect({
  filterId,
  filterKey,
  label,
  options,
  value,
  onValueChange,
  placeholder,
  allLabel,
  className,
  showLabel = true,
  triggerClassName = "w-full",
}: FilterSelectProps) {
  const displayValue = value || "__all__";
  const effectiveAllLabel = allLabel || `جميع ${label}`;
  const effectivePlaceholder = placeholder || `اختر ${label}`;

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor={filterId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Select
        value={displayValue}
        onValueChange={(selectedValue) =>
          onValueChange(filterKey, selectedValue === "__all__" ? "" : selectedValue)
        }
      >
        <SelectTrigger id={filterId} className={triggerClassName}>
          <SelectValue placeholder={effectivePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{effectiveAllLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {typeof option.label === "string" ? (
                option.label
              ) : (
                <div className="flex items-center gap-2">
                  {option.label}
                </div>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
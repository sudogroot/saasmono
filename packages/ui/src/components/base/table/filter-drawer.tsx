"use client";

import { Button } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../ui/drawer";
import { Filter } from "lucide-react";
import { FilterSelect } from "./filter-select";
import type { FilterDrawerProps } from "./types";

export function FilterDrawer({
  isOpen,
  onClose,
  quickFilters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-right">
          <DrawerTitle className="flex items-center justify-between">
            <span>تصفية البيانات</span>
            <Filter className="h-5 w-5" />
          </DrawerTitle>
          <DrawerDescription>
            اختر المرشحات لتخصيص عرض البيانات
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-2 space-y-4 max-h-[50vh] overflow-y-auto">
          {quickFilters.map((filter) => (
            <FilterSelect
              key={filter.key}
              filterId={filter.key}
              filterKey={filter.key}
              label={filter.label}
              options={filter.values}
              value={activeFilters[filter.key] || ""}
              onValueChange={onFilterChange}
              className="space-y-2"
              showLabel={true}
              triggerClassName="w-full"
            />
          ))}
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button onClick={onClearAll} variant="outline" className="flex-1">
            مسح الكل
          </Button>
          <DrawerClose asChild>
            <Button className="flex-1">تطبيق</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
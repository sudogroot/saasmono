"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Filter, X } from "lucide-react";
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
            <div key={filter.key} className="space-y-2">
              <Label htmlFor={filter.key} className="text-sm font-medium">
                {filter.label}
              </Label>
              <Select
                value={activeFilters[filter.key] || "__all__"}
                onValueChange={(value) => onFilterChange(filter.key, value === "__all__" ? "" : value)}
              >
                <SelectTrigger id={filter.key} className="w-full">
                  <SelectValue placeholder={`اختر ${filter.label}`} />
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
            </div>
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
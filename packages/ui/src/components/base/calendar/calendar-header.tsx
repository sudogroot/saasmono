import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { CalendarHeaderProps, CalendarView } from "./types";
import { cn } from "../../../lib/utils";

export function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions =
      view === "day"
        ? { year: "numeric", month: "long", day: "numeric" }
        : { year: "numeric", month: "long" };
    return currentDate.toLocaleDateString("ar-TN", options);
  };

  const getDayName = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("ar-TN", { weekday: "long" });
    }
    return null;
  };

  const viewLabels: Record<CalendarView, string> = {
    day: "عرض اليوم",
    week: "عرض الأسبوع",
    month: "عرض الشهر",
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        {/* View Selector - Desktop */}
        <div className="hidden md:flex md:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-x-2">
                {viewLabels[view]}
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onViewChange("day")}>
                عرض اليوم
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange("week")}>
                عرض الأسبوع
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange("month")}>
                عرض الشهر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">فتح القائمة</span>
                <EllipsisVerticalIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onToday}>اليوم</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange("day")}>
                عرض اليوم
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange("week")}>
                عرض الأسبوع
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange("month")}>
                عرض الشهر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <h1 className="text-lg font-semibold text-foreground">
          <time dateTime={currentDate.toISOString()}>{formatDate()}</time>
        </h1>
        {getDayName() && (
          <p className="mt-0.5 text-sm text-muted-foreground">{getDayName()}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Navigation Controls */}
        <div className="relative flex items-center rounded-md border border-gray-300 bg-white shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-9 w-10 rounded-r-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <span className="sr-only">التالي</span>
            <ChevronLeftIcon className="size-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={onToday}
            className="hidden h-9 px-4 text-sm font-medium hover:bg-accent md:block"
          >
            اليوم
          </Button>

          <span className="relative h-5 w-px bg-gray-300 md:block hidden" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-9 w-10 rounded-l-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <span className="sr-only">السابق</span>
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
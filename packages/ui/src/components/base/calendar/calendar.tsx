import * as React from "react";
import { CalendarProps, CalendarEvent, CalendarView } from "./types";
import { CalendarHeader } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { CalendarEventSheet } from "./calendar-event-sheet";
import { cn } from "../../../lib/utils";
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfToday,
} from "date-fns";

export function Calendar({
  events,
  view: initialView = "month",
  initialDate,
  onEventClick,
  onDateChange,
  onViewChange,
  className,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(
    initialDate || startOfToday()
  );
  const [view, setView] = React.useState<CalendarView>(initialView);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(
    null
  );
  const [isEventSheetOpen, setIsEventSheetOpen] = React.useState(false);

  const handlePrevious = () => {
    let newDate: Date;
    switch (view) {
      case "day":
        newDate = subDays(currentDate, 1);
        break;
      case "week":
        newDate = subWeeks(currentDate, 1);
        break;
      case "month":
        newDate = subMonths(currentDate, 1);
        break;
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    switch (view) {
      case "day":
        newDate = addDays(currentDate, 1);
        break;
      case "week":
        newDate = addWeeks(currentDate, 1);
        break;
      case "month":
        newDate = addMonths(currentDate, 1);
        break;
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = startOfToday();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    onViewChange?.(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
    onEventClick?.(event);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    onDateChange?.(date);
    // Switch to day view when selecting a date from month view
    if (view === "month") {
      setView("day");
      onViewChange?.("day");
    }
  };

  const renderView = () => {
    const viewProps = {
      currentDate,
      events,
      onEventClick: handleEventClick,
      onDateSelect: handleDateSelect,
    };

    switch (view) {
      case "day":
        return <DayView {...viewProps} />;
      case "week":
        return <WeekView {...viewProps} />;
      case "month":
        return <MonthView {...viewProps} />;
      default:
        return <MonthView {...viewProps} />;
    }
  };

  return (
    <div className={cn("flex h-full flex-col bg-card", className)} dir="rtl">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
      />

      <div className="flex flex-1 overflow-hidden">
        {renderView()}
      </div>

      <CalendarEventSheet
        event={selectedEvent}
        open={isEventSheetOpen}
        onOpenChange={setIsEventSheetOpen}
      />
    </div>
  );
}
"use client";

import * as React from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  Views,
  SlotInfo,
  Event as BigCalendarEvent,
} from "react-big-calendar";
import moment from "moment";
import "moment/locale/ar-tn";
import { CalendarEvent, CalendarView } from "./types";
import { CalendarEventSheet } from "./calendar-event-sheet";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarIcon,
} from "lucide-react";
import { cn } from "../../../lib/utils";

// Configure moment with Arabic Tunisia locale
moment.locale("ar-tn");
const localizer = momentLocalizer(moment);

// Arabic messages for React Big Calendar
const arabicMessages = {
  allDay: "طوال اليوم",
  previous: "السابق",
  next: "التالي",
  today: "اليوم",
  month: "شهر",
  week: "أسبوع",
  day: "يوم",
  agenda: "جدول الأعمال",
  date: "التاريخ",
  time: "الوقت",
  event: "حدث",
  noEventsInRange: "لا توجد أحداث في هذا النطاق",
  showMore: (total: number) => `+${total} أخرى`,
};

interface BigCalendarWrapperProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateChange?: (date: Date) => void;
  className?: string;
}

// Convert CalendarEvent to BigCalendar Event format
interface RBCEvent extends BigCalendarEvent {
  resource: CalendarEvent;
}

export function BigCalendarWrapper({
  events,
  onEventClick,
  onDateChange,
  className,
}: BigCalendarWrapperProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [view, setView] = React.useState<View>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(
    null
  );
  const [isEventSheetOpen, setIsEventSheetOpen] = React.useState(false);

  // Convert our events to React Big Calendar format
  const rbcEvents: RBCEvent[] = React.useMemo(() => {
    return events.map((event) => ({
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      resource: event,
    }));
  }, [events]);

  const handleSelectEvent = (event: RBCEvent) => {
    setSelectedEvent(event.resource);
    setIsEventSheetOpen(true);
    onEventClick?.(event.resource);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Custom event style getter
  const eventStyleGetter = (event: RBCEvent) => {
    const calendarEvent = event.resource;
    const colorMap: Record<string, { bg: string; border: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-500" },
      pink: { bg: "bg-pink-50", border: "border-pink-500" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-500" },
      gray: { bg: "bg-gray-100", border: "border-gray-500" },
      green: { bg: "bg-green-50", border: "border-green-500" },
      yellow: { bg: "bg-yellow-50", border: "border-yellow-500" },
      red: { bg: "bg-red-50", border: "border-red-500" },
    };

    const colors = colorMap[calendarEvent.color || "indigo"];

    return {
      className: cn(
        "rounded-md border-r-4 px-2 py-1 text-xs font-medium transition-colors hover:opacity-80",
        colors?.bg || "bg-indigo-50",
        colors?.border || "border-indigo-500"
      ),
      style: {},
    };
  };

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">{label}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="size-4" />
                <span>
                  {view === Views.MONTH
                    ? "عرض الشهر"
                    : view === Views.WEEK
                      ? "عرض الأسبوع"
                      : view === Views.DAY
                        ? "عرض اليوم"
                        : "جدول الأعمال"}
                </span>
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onView(Views.MONTH)}>
                عرض الشهر
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(Views.WEEK)}>
                عرض الأسبوع
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(Views.DAY)}>
                عرض اليوم
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(Views.AGENDA)}>
                جدول الأعمال
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Navigation */}
          <div className="flex items-center gap-1 rounded-md border border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("NEXT")}
              className="h-9 w-9"
            >
              <ChevronLeftIcon className="size-5" />
              <span className="sr-only">التالي</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("TODAY")}
              className="h-9 px-3"
            >
              اليوم
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("PREV")}
              className="h-9 w-9"
            >
              <ChevronRightIcon className="size-5" />
              <span className="sr-only">السابق</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex h-full flex-col p-6", className)} dir="rtl">
      <BigCalendar
        localizer={localizer}
        events={rbcEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={handleViewChange}
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        messages={arabicMessages}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        className="rbc-calendar-custom"
        style={{ height: "100%" }}
        rtl={true}
        culture="ar-tn"
      />

      <CalendarEventSheet
        event={selectedEvent}
        open={isEventSheetOpen}
        onOpenChange={setIsEventSheetOpen}
      />
    </div>
  );
}
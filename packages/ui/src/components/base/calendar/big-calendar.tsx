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

  // Custom event style getter with data attributes for CSS styling
  const eventStyleGetter = (event: RBCEvent) => {
    const calendarEvent = event.resource;

    return {
      className: cn(
        "group cursor-pointer",
        `data-[color=${calendarEvent.color || "indigo"}]`
      ),
      style: {},
    };
  };

  // Custom event wrapper to add data attributes
  const EventWrapper = ({ event, children }: any) => {
    return (
      <div data-color={event.resource?.color || "indigo"}>
        {children}
      </div>
    );
  };

  // Custom toolbar with modern design
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <CalendarIcon className="size-5 text-primary" />
          </div>
          <h2 className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-2xl font-bold text-transparent">
            {label}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shadow-sm transition-all hover:shadow-md"
              >
                <span className="font-medium">
                  {view === Views.MONTH
                    ? "عرض الشهر"
                    : view === Views.WEEK
                      ? "عرض الأسبوع"
                      : view === Views.DAY
                        ? "عرض اليوم"
                        : "جدول الأعمال"}
                </span>
                <ChevronDownIcon className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem
                onClick={() => onView(Views.MONTH)}
                className="cursor-pointer"
              >
                عرض الشهر
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onView(Views.WEEK)}
                className="cursor-pointer"
              >
                عرض الأسبوع
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onView(Views.DAY)}
                className="cursor-pointer"
              >
                عرض اليوم
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onView(Views.AGENDA)}
                className="cursor-pointer"
              >
                جدول الأعمال
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Navigation */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("NEXT")}
              className="h-9 w-9 rounded-none hover:bg-accent"
            >
              <ChevronLeftIcon className="size-5" />
              <span className="sr-only">التالي</span>
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("TODAY")}
              className="h-9 rounded-none px-4 font-medium hover:bg-accent"
            >
              اليوم
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("PREV")}
              className="h-9 w-9 rounded-none hover:bg-accent"
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
          eventWrapper: EventWrapper,
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
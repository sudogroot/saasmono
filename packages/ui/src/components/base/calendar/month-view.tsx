import * as React from "react";
import { CalendarViewProps, CalendarEvent } from "./types";
import { cn } from "../../../lib/utils";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { arTN } from "date-fns/locale";

interface DayWithEvents {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const arabicDays = [
  { short: "الإ", full: "الإثنين" },
  { short: "الث", full: "الثلاثاء" },
  { short: "الأ", full: "الأربعاء" },
  { short: "الخ", full: "الخميس" },
  { short: "الج", full: "الجمعة" },
  { short: "الس", full: "السبت" },
  { short: "الأ", full: "الأحد" },
];

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateSelect,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const daysWithEvents: DayWithEvents[] = days.map((date) => {
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    });

    return {
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      events: dayEvents,
    };
  });

  const getEventColorClass = (color?: string) => {
    if (!color) return "bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700 hover:bg-indigo-100";

    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 border-r-4 border-blue-500 text-blue-700 hover:bg-blue-100",
      pink: "bg-pink-50 border-r-4 border-pink-500 text-pink-700 hover:bg-pink-100",
      indigo: "bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700 hover:bg-indigo-100",
      gray: "bg-gray-100 border-r-4 border-gray-500 text-gray-700 hover:bg-gray-200",
      green: "bg-green-50 border-r-4 border-green-500 text-green-700 hover:bg-green-100",
      yellow: "bg-yellow-50 border-r-4 border-yellow-500 text-yellow-700 hover:bg-yellow-100",
      red: "bg-red-50 border-r-4 border-red-500 text-red-700 hover:bg-red-100",
    };

    return colorMap[color] || "bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700 hover:bg-indigo-100";
  };

  return (
    <div className="shadow-sm ring-1 ring-border lg:flex lg:flex-auto lg:flex-col overflow-hidden rounded-lg">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-px border-b border-border bg-muted text-center text-sm font-semibold text-foreground">
        {arabicDays.map((day, idx) => (
          <div key={idx} className="flex justify-center bg-card py-3 px-2">
            <span className="hidden sm:inline">{day.full}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex bg-muted text-sm text-foreground lg:flex-auto">
        {/* Desktop view */}
        <div className="hidden w-full lg:grid lg:grid-cols-7 lg:auto-rows-fr lg:gap-px">
          {daysWithEvents.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                "group relative min-h-[120px] px-3 py-2",
                day.isCurrentMonth ? "bg-card" : "bg-muted/50"
              )}
            >
              <time
                dateTime={format(day.date, "yyyy-MM-dd")}
                className={cn(
                  "relative inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  !day.isCurrentMonth && "text-muted-foreground",
                  day.isCurrentMonth && "text-foreground hover:bg-accent",
                  day.isToday &&
                    "bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                )}
              >
                {format(day.date, "d")}
              </time>
              {day.events.length > 0 && (
                <ol className="mt-2 space-y-1.5">
                  {day.events.slice(0, 3).map((event) => (
                    <li key={event.id}>
                      <button
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "group/event flex w-full text-right rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                          getEventColorClass(event.color)
                        )}
                      >
                        <div className="flex-1 truncate">
                          <p className="truncate font-semibold">{event.title}</p>
                          <time
                            dateTime={event.startTime.toISOString()}
                            className="text-[10px] opacity-75 mt-0.5"
                          >
                            {format(event.startTime, "h:mm a", { locale: arTN })}
                          </time>
                        </div>
                      </button>
                    </li>
                  ))}
                  {day.events.length > 3 && (
                    <li className="text-xs text-muted-foreground px-2">
                      +{day.events.length - 3} أخرى
                    </li>
                  )}
                </ol>
              )}
            </div>
          ))}
        </div>

        {/* Mobile view */}
        <div className="isolate grid w-full grid-cols-7 auto-rows-fr gap-px lg:hidden">
          {daysWithEvents.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onDateSelect?.(day.date)}
              className={cn(
                "group relative flex min-h-[60px] flex-col px-2 py-2 hover:bg-accent focus:z-10 transition-colors",
                !day.isCurrentMonth && "bg-muted/50 text-muted-foreground",
                day.isCurrentMonth && "bg-card text-foreground"
              )}
            >
              <time
                dateTime={format(day.date, "yyyy-MM-dd")}
                className={cn(
                  "text-sm font-medium",
                  !day.isCurrentMonth && "opacity-50",
                  day.isToday &&
                    "flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold"
                )}
              >
                {format(day.date, "d")}
              </time>
              <span className="sr-only">{day.events.length} أحداث</span>
              {day.events.length > 0 && (
                <span className="mt-auto flex flex-wrap gap-1 justify-center">
                  {day.events.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className="size-1.5 rounded-full bg-primary"
                    />
                  ))}
                  {day.events.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{day.events.length - 3}</span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import * as React from "react";
import { CalendarViewProps, CalendarEvent } from "./types";
import { cn } from "../../../lib/utils";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
} from "date-fns";
import { arTN } from "date-fns/locale";

const arabicDaysShort = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

export function WeekView({
  currentDate,
  events,
  onEventClick,
}: CalendarViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();

    const startSlot = startHour * 2 + (startMinute >= 30 ? 1 : 0);
    const endSlot = endHour * 2 + (endMinute >= 30 ? 1 : 0);
    const duration = Math.max(endSlot - startSlot, 1);

    return {
      gridRow: `${startSlot + 2} / span ${duration}`,
    };
  };

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
    <div className="isolate flex flex-auto flex-col overflow-auto bg-card">
      <div className="flex max-w-full flex-none flex-col">
        {/* Day headers */}
        <div className="sticky top-0 z-30 flex-none bg-card shadow-sm ring-1 ring-border">
          <div className="grid grid-cols-7 text-sm text-muted-foreground sm:hidden">
            {days.map((day, idx) => (
              <button
                key={day.toISOString()}
                type="button"
                className="flex flex-col items-center gap-2 pt-3 pb-2"
              >
                <span className="text-xs">{arabicDaysShort[idx]?.substring(0, 3)}</span>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden grid-cols-7 divide-x divide-border border-r border-border text-sm sm:grid">
            <div className="col-end-1 w-16" />
            {days.map((day, idx) => (
              <div key={day.toISOString()} className="flex items-center justify-center py-3 gap-2">
                <span className="text-muted-foreground">{arabicDaysShort[idx]}</span>
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full font-semibold transition-colors",
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Time grid */}
        <div className="flex flex-auto">
          <div className="sticky right-0 z-10 w-16 flex-none bg-card ring-1 ring-border" />
          <div className="grid flex-auto grid-cols-1 grid-rows-1">
            {/* Horizontal lines */}
            <div
              style={{ gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))" }}
              className="col-start-1 col-end-2 row-start-1 grid divide-y divide-border"
            >
              <div className="row-end-1 h-7" />
              {Array.from({ length: 24 }, (_, i) => (
                <React.Fragment key={i}>
                  <div>
                    <div className="sticky right-0 z-20 -mt-3 -mr-16 w-16 pl-2 text-left text-xs text-muted-foreground">
                      {i === 0 ? "12 ص" : i < 12 ? `${i} ص` : i === 12 ? "12 م" : `${i - 12} م`}
                    </div>
                  </div>
                  <div />
                </React.Fragment>
              ))}
            </div>

            {/* Vertical lines */}
            <div className="col-start-1 col-end-2 row-start-1 hidden grid-rows-1 divide-x divide-border sm:grid sm:grid-cols-7">
              {days.map((_, idx) => (
                <div key={idx} className="row-span-full" />
              ))}
            </div>

            {/* Events */}
            <ol
              style={{ gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto" }}
              className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7"
            >
              {days.map((day, dayIdx) => {
                const dayEvents = events.filter((event) =>
                  isSameDay(new Date(event.startTime), day)
                );

                return dayEvents.map((event) => (
                  <li
                    key={event.id}
                    style={{
                      ...getEventPosition(event),
                      gridColumnStart: dayIdx + 1,
                    }}
                    className="relative mt-px hidden sm:flex"
                  >
                    <button
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "group absolute inset-1 flex flex-col overflow-hidden rounded-lg p-2 text-xs transition-colors",
                        getEventColorClass(event.color)
                      )}
                    >
                      <p className="font-semibold truncate text-right">{event.title}</p>
                      {event.description && (
                        <p className="text-[10px] opacity-75 truncate text-right mt-0.5">{event.description}</p>
                      )}
                      <p className="text-[10px] opacity-75 mt-1 text-right">
                        <time dateTime={event.startTime.toISOString()}>
                          {format(event.startTime, "h:mm a", { locale: arTN })}
                        </time>
                      </p>
                    </button>
                  </li>
                ));
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
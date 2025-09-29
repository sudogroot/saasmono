import * as React from "react";
import { CalendarViewProps, CalendarEvent } from "./types";
import { cn } from "../../../lib/utils";
import { format, isSameDay } from "date-fns";
import { arTN } from "date-fns/locale";

export function DayView({
  currentDate,
  events,
  onEventClick,
}: CalendarViewProps) {
  // Filter events for the current day
  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.startTime), currentDate)
  );

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
    <div className="isolate flex flex-auto overflow-hidden bg-card">
      <div className="flex flex-auto flex-col overflow-auto">
        {/* Time grid */}
        <div className="flex w-full flex-auto">
          <div className="w-16 flex-none bg-card ring-1 ring-border" />
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
                    <div className="-mt-3 -mr-16 w-16 pl-2 text-left text-xs text-muted-foreground">
                      {i === 0 ? "12 ص" : i < 12 ? `${i} ص` : i === 12 ? "12 م" : `${i - 12} م`}
                    </div>
                  </div>
                  <div />
                </React.Fragment>
              ))}
            </div>

            {/* Events */}
            <ol
              style={{ gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto" }}
              className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
            >
              {dayEvents.map((event) => (
                <li
                  key={event.id}
                  style={getEventPosition(event)}
                  className="relative mt-px flex"
                >
                  <button
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      "group absolute inset-1 flex flex-col overflow-hidden rounded-lg p-3 text-sm transition-colors",
                      getEventColorClass(event.color)
                    )}
                  >
                    <p className="font-semibold text-right">{event.title}</p>
                    {event.description && (
                      <p className="text-xs opacity-75 mt-1 text-right line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs opacity-75 mt-2 text-right">
                      <time dateTime={event.startTime.toISOString()}>
                        {format(event.startTime, "h:mm a", { locale: arTN })}
                      </time>
                      {" - "}
                      <time dateTime={event.endTime.toISOString()}>
                        {format(event.endTime, "h:mm a", { locale: arTN })}
                      </time>
                    </p>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
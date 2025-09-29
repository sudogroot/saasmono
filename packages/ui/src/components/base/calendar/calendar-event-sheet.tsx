import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "../../ui/sheet";
import { CalendarEvent } from "./types";
import { format } from "date-fns";
import { arTN } from "date-fns/locale";
import { ClockIcon, CalendarIcon, InfoIcon } from "lucide-react";
import { cn } from "../../../lib/utils";

interface CalendarEventSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const metadataLabels: Record<string, string> = {
  trialNumber: "رقم الجلسة",
  caseNumber: "رقم القضية",
  caseTitle: "عنوان القضية",
  clientName: "اسم الموكل",
  courtName: "المحكمة",
};

export function CalendarEventSheet({
  event,
  open,
  onOpenChange,
}: CalendarEventSheetProps) {
  if (!event) return null;

  const getEventColorClass = (color?: string) => {
    if (!color) return "bg-indigo-500";

    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      gray: "bg-gray-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
    };

    return colorMap[color] || "bg-indigo-500";
  };

  const duration = Math.round(
    (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
  );

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationText =
    hours > 0
      ? `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ""}`
      : `${minutes} دقيقة`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader className="p-4 pb-0">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "h-12 w-1 rounded-full flex-shrink-0",
                getEventColorClass(event.color)
              )}
            />
            <SheetTitle className="text-right text-xl leading-relaxed">
              {event.title}
            </SheetTitle>
          </div>
        </SheetHeader>

        <SheetBody>
          <div className="space-y-6 py-6">
            {/* Date and Time Card */}
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-1 size-5 text-primary flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {format(event.startTime, "EEEE، d MMMM yyyy", {
                      locale: arTN,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockIcon className="mt-1 size-5 text-primary flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {format(event.startTime, "h:mm a", { locale: arTN })} -{" "}
                    {format(event.endTime, "h:mm a", { locale: arTN })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    المدة: {durationText}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <InfoIcon className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    تفاصيل الجلسة
                  </h3>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed text-right whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  معلومات إضافية
                </h3>
                <div className="space-y-2">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {value ? String(value) : "-"}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {metadataLabels[key] || key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
'use client'

import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@repo/ui/components/ui/sheet'
import { useQuery } from '@tanstack/react-query'
import { CalendarX, Loader2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import './fullcalendar-styles.css'

// Arabic locale
const arLocale = {
  code: 'ar',
  week: {
    dow: 6, // Saturday
    doy: 12,
  },
  direction: 'rtl' as const,
  buttonText: {
    prev: 'السابق',
    next: 'التالي',
    today: 'اليوم',
    year: 'سنة',
    month: 'شهر',
    week: 'أسبوع',
    day: 'يوم',
    list: 'قائمة',
  },
  weekText: 'أسبوع',
  allDayText: 'طوال اليوم',
  moreLinkText: 'المزيد',
  noEventsText: 'لا توجد أحداث',
}

interface TrialEvent {
  id: string
  title: string
  start: Date
  end: Date
  extendedProps: {
    trialNumber: number
    caseNumber: string
    caseTitle: string
    clientName: string
    courtName: string
  }
}

export default function CalendarPage() {
  const { data: session } = authClient.useSession()
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedEvent, setSelectedEvent] = useState<TrialEvent | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const {
    data: trials = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.trials.listTrials.queryOptions(),
    enabled: !!session,
  })

  // Convert trials to FullCalendar events
  const events = useMemo(() => {
    const calendarEvents = trials.map((trial) => {
      const startTime = new Date(trial.trialDateTime)
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000)

      // Color mapping
      const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        indigo: {
          bg: 'hsl(263 70% 92%)',
          border: 'hsl(263 70% 50%)',
          text: 'hsl(263 70% 25%)',
        },
        blue: {
          bg: 'hsl(217 91% 92%)',
          border: 'hsl(217 91% 60%)',
          text: 'hsl(217 91% 25%)',
        },
        green: {
          bg: 'hsl(142 76% 92%)',
          border: 'hsl(142 76% 50%)',
          text: 'hsl(142 76% 25%)',
        },
      }

      const colors = colorMap.indigo

      return {
        id: trial.id,
        title: `${trial.caseTitle} - جلسة ${trial.trialNumber}`,
        start: startTime,
        end: endTime,
        // backgroundColor: colors.bg,
        // borderColor: colors.border,
        // textColor: colors.text,
        extendedProps: {
          trialNumber: trial.trialNumber,
          caseNumber: trial.caseNumber,
          caseTitle: trial.caseTitle,
          clientName: trial.clientName,
          courtName: trial.courtName,
        },
      }
    })

    console.log('Calendar Events:', calendarEvents)
    console.log('Trials Data:', trials)
    return calendarEvents
  }, [trials])

  const handleEventClick = (info: EventClickArg) => {
    console.log('Event clicked:', info.event)
    const event: TrialEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start || new Date(),
      end: info.event.end || new Date(),
      extendedProps: info.event.extendedProps as TrialEvent['extendedProps'],
    }
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  const handleDateSelect = (info: DateSelectArg) => {
    console.log('Date selected:', info.start, info.end)
    // TODO: Create new event
  }

  const handleEventDrop = (info: EventDropArg) => {
    console.log('Event dropped:', info.event.id, info.event.start, info.event.end)
    // TODO: Update event in backend
  }

  const handleEventResize = (info: EventResizeDoneArg) => {
    console.log('Event resized:', info.event.id, info.event.start, info.event.end)
    // TODO: Update event in backend
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">جاري تحميل التقويم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-destructive/10 rounded-full p-4">
            <CalendarX className="text-destructive h-8 w-8" />
          </div>
          <div>
            <p className="text-foreground text-lg font-semibold">حدث خطأ في تحميل البيانات</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {error instanceof Error ? error.message : 'خطأ غير معروف'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-[calc(100vh-80px)] w-full p-4" dir="rtl">
        <div className="border-border bg-card h-full w-full overflow-hidden rounded-xl border shadow-sm">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={arLocale}
            direction="rtl"
            height="100%"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
            }}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            weekends={true}
            nowIndicator={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            allDaySlot={true}
            expandRows={false}
            stickyHeaderDates={true}
            scrollTime="08:00:00"
            scrollTimeReset={false}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            buttonText={{
              today: 'اليوم',
              month: 'شهر',
              week: 'أسبوع',
              day: 'يوم',
              list: 'قائمة',
              dayGridMonth: 'شهر',
              timeGridWeek: 'أسبوع',
              timeGridDay: 'يوم',
              listMonth: 'قائمة',
            }}
            views={{
              listMonth: {
                buttonText: 'قائمة',
              },
            }}
          />
        </div>
      </div>

      {/* Event Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedEvent?.title}</SheetTitle>
            <SheetDescription>تفاصيل الجلسة</SheetDescription>
          </SheetHeader>

          {selectedEvent && (
            <div className="mt-6 space-y-4" dir="rtl">
              <div>
                <p className="text-muted-foreground text-sm font-medium">رقم الجلسة</p>
                <p className="text-lg">{selectedEvent.extendedProps.trialNumber}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">رقم القضية</p>
                <p className="text-lg">{selectedEvent.extendedProps.caseNumber}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">عنوان القضية</p>
                <p className="text-lg">{selectedEvent.extendedProps.caseTitle}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">اسم الموكل</p>
                <p className="text-lg">{selectedEvent.extendedProps.clientName}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">المحكمة</p>
                <p className="text-lg">{selectedEvent.extendedProps.courtName}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">وقت البداية</p>
                <p className="text-lg">
                  {selectedEvent.start.toLocaleString('ar-SA', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">وقت النهاية</p>
                <p className="text-lg">
                  {selectedEvent.end.toLocaleString('ar-SA', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

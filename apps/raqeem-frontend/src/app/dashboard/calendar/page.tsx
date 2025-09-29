'use client'

import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { CalendarEvent, BigCalendarWrapper } from '@repo/ui'
import '@repo/ui/calendar.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useQuery } from '@tanstack/react-query'
import { Loader2, CalendarX } from 'lucide-react'
import { useMemo } from 'react'

export default function CalendarPage() {
  const { data: session } = authClient.useSession()

  // Fetch trials data
  const {
    data: trials = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.trials.listTrials.queryOptions(),
    enabled: !!session,
  })

  // Convert trials to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return trials.map((trial) => {
      const startTime = new Date(trial.trialDateTime)
      // Default duration: 2 hours
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000)

      return {
        id: trial.id,
        title: `${trial.caseTitle} - جلسة ${trial.trialNumber}`,
        description: `الموكل: ${trial.clientName}\nالمحكمة: ${trial.courtName}\nالقضية: ${trial.caseNumber}`,
        startTime,
        endTime,
        color: 'indigo',
        metadata: {
          trialNumber: trial.trialNumber,
          caseNumber: trial.caseNumber,
          caseTitle: trial.caseTitle,
          clientName: trial.clientName,
          courtName: trial.courtName,
        },
      }
    })
  }, [trials])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جاري تحميل التقويم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <CalendarX className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">حدث خطأ في تحميل البيانات</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'خطأ غير معروف'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <BigCalendarWrapper
        events={calendarEvents}
        onEventClick={(event) => {
          console.log('Event clicked:', event)
          // You can add navigation to trial details here if needed
        }}
      />
    </div>
  )
}

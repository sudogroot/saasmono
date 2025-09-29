'use client'

import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { CalendarEvent, FullCalendar } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : 'خطأ غير معروف'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col rounded-lg border border-border bg-card shadow-sm">
      <FullCalendar
        events={calendarEvents}
        view="month"
        onEventClick={(event) => {
          console.log('Event clicked:', event)
          // You can add navigation to trial details here if needed
        }}
      />
    </div>
  )
}

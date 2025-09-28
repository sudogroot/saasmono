'use client'

import { TimetableVisualization } from '@/components/timetable/timetable-visualization'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

export default function TimetablePage() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <TimetableVisualization />
  }

  return (
    <TimetableVisualization />
  )
}
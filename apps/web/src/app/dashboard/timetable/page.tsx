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
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">جدول الحصص</h1>
          <p className="text-muted-foreground">عرض وتحميل جداول الحصص الأسبوعية</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>جدول الحصص الأسبوعي</CardTitle>
          <CardDescription>اختر الفصل أو المجموعة لعرض جدول الحصص وتحميله كصورة</CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableVisualization />
        </CardContent>
      </Card>
    </div>
  )
}
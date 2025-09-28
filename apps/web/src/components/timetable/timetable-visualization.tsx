'use client'

import { orpc } from '@/utils/orpc'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Download, Filter } from 'lucide-react'
import { useRef, useState } from 'react'
import { TimetableFilters } from './timetable-filters'
import { TimetableGrid } from './timetable-grid'
import { formatFileSize, generateTimetableImage } from './timetable-image-generator'

export interface TimetableFilterState {
  classroomId?: string
  classroomGroupId?: string
  startDate?: Date
  endDate?: Date
}

export function TimetableVisualization() {
  const [filters, setFilters] = useState<TimetableFilterState>({})
  const [showFilters, setShowFilters] = useState(true)
  const timetableRef = useRef<HTMLDivElement>(null)

  // Get timetable data based on filters
  const { data: timetableData = [], isLoading, error } = useQuery(
    orpc.management.timetables.getTimetablesList.queryOptions({
      classroomId: filters.classroomId,
      classroomGroupId: filters.classroomGroupId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    })
  )

  const handleDownload = async () => {
    if (!timetableRef.current) return

    try {
      const result = await generateTimetableImage(timetableRef.current, {
        filename: `timetable-${new Date().toISOString().split('T')[0]}.png`,
        format: 'png',
        quality: 1.0,
        scale: 1.5, // Reduce scale to avoid memory issues
      })

      if (result.success) {
        console.log(`تم تحميل الجدول بنجاح: ${result.filename} (${formatFileSize(result.size)})`)
      }
    } catch (error) {
      console.error('Failed to generate timetable image:', error)

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'

      // You could replace this with a toast notification or modal
      alert(`خطأ في تحميل الجدول: ${errorMessage}`)
    }
  }

  const hasValidFilter = filters.classroomId || filters.classroomGroupId

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                تصفية الجدول
              </CardTitle>
              <CardDescription>اختر الفصل أو المجموعة لعرض جدول الحصص</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <TimetableFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        )}
      </Card>

      {/* Timetable Grid Section */}
      {hasValidFilter ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  جدول الحصص الأسبوعي
                </CardTitle>
                <CardDescription>
                  {filters.classroomId
                    ? 'جدول حصص الفصل'
                    : 'جدول حصص المجموعة'} - الأسبوع الحالي
                </CardDescription>
              </div>
              <Button
                onClick={handleDownload}
                disabled={isLoading || timetableData.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                تحميل كصورة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={timetableRef}>
              <TimetableGrid
                timetableData={timetableData}
                isLoading={isLoading}
                error={error}
                filters={filters}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Calendar className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">اختر فصل أو مجموعة</h3>
                <p className="text-muted-foreground mt-1">
                  يرجى اختيار فصل أو مجموعة من الفلاتر أعلاه لعرض جدول الحصص
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
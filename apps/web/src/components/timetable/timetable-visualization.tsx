'use client'

import { orpc } from '@/utils/orpc'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Calendar, Download, Filter } from 'lucide-react'
import { useState } from 'react'
import { TimetableFilters } from './timetable-filters'
import { TimetableGrid } from './timetable-grid'

export interface TimetableFilterState {
  classroomId?: string
  classroomGroupId?: string
  startDate?: Date
  endDate?: Date
}

export function TimetableVisualization() {
  const [filters, setFilters] = useState<TimetableFilterState>({})
  const [showFilters, setShowFilters] = useState(true)

  // Only fetch timetable data when there's a valid filter (classroomId or classroomGroupId)
  const hasValidFilter = Boolean(filters.classroomId || filters.classroomGroupId)

  const { data: timetableData = [], isLoading, error } = useQuery({
    ...orpc.management.timetables.getTimetablesList.queryOptions({
      input: {
        classroomId: filters.classroomId,
        classroomGroupId: filters.classroomGroupId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }
    }),
    enabled: hasValidFilter, // Only run query when we have a valid filter
  })

  // Mutation for generating timetable image
  const generateImageMutation = useMutation(
    orpc.management.timetables.generateTimetableImage.mutationOptions()
  )

  const handleDownload = async () => {
    try {
      const result = await generateImageMutation.mutateAsync({
        classroomId: filters.classroomId,
        classroomGroupId: filters.classroomGroupId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })

      if (result.success && result.imagePath) {
        // Backend now returns full URL, use it directly for download
        const link = document.createElement('a')
        link.href = result.imagePath
        link.download = `timetable-${new Date().toISOString().split('T')[0]}.png`
        link.target = '_blank' // Open in new tab to ensure download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log(`تم تحميل الجدول بنجاح: ${result.message}`)
      } else {
        throw new Error(result.message || 'فشل في إنشاء صورة جدول الحصص')
      }
    } catch (error) {
      console.error('Failed to generate timetable image:', error)

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'

      // You could replace this with a toast notification or modal
      alert(`خطأ في تحميل الجدول: ${errorMessage}`)
    }
  }

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
                disabled={isLoading || timetableData.length === 0 || generateImageMutation.isPending}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {generateImageMutation.isPending ? 'جاري إنشاء الصورة...' : 'تحميل كصورة'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white">
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
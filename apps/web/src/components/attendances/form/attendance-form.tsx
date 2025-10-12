'use client'

import { useState, useEffect } from 'react'
import { Button, Label, Card, Textarea } from '@repo/ui'
import { TimetableCombobox } from '@/components/commun/timetable-combobox'
import { StudentAttendanceList } from './student-attendance-list'
import { Loader2, Save, X } from 'lucide-react'
import { orpc } from '@/utils/orpc'
import { useQuery } from '@tanstack/react-query'

interface StudentAttendance {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK'
  note?: string
  arrivedAt?: Date
}

interface AttendanceFormData {
  timetableId: string
  generalNotes: string
  attendances: StudentAttendance[]
}

interface AttendanceFormProps {
  initialData?: Partial<AttendanceFormData>
  onSubmit: (data: AttendanceFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  readOnlyTimetable?: boolean
}

export function AttendanceForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'حفظ',
  isLoading = false,
  readOnlyTimetable = false,
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<AttendanceFormData>({
    timetableId: initialData.timetableId || '',
    generalNotes: initialData.generalNotes || '',
    attendances: initialData.attendances || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch students when timetable is selected
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    ...orpc.management.attendances.getStudentsByTimetable.queryOptions({
      input: { timetableId: formData.timetableId },
    }),
    enabled: !!formData.timetableId,
  }) as any

  const handleChange = (field: keyof AttendanceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.timetableId) {
      newErrors.timetableId = 'يجب اختيار جلسة'
    }

    if (formData.attendances.length === 0) {
      newErrors.attendances = 'يجب تحديد حالة حضور طالب واحد على الأقل'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Timetable Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">اختيار الجلسة</h3>
        <div className="space-y-2">
          <Label htmlFor="timetable">
            الجلسة <span className="text-destructive">*</span>
          </Label>
          <TimetableCombobox
            value={formData.timetableId}
            onChange={(value) => {
              handleChange('timetableId', value || '')
              // Reset attendances when timetable changes
              if (value !== formData.timetableId) {
                handleChange('attendances', [])
              }
            }}
            disabled={isLoading || readOnlyTimetable}
          />
          {errors.timetableId && (
            <p className="text-sm text-destructive">{errors.timetableId}</p>
          )}
          <p className="text-xs text-muted-foreground">
            يتم عرض جلسات الأسبوع الحالي فقط (الإثنين - السبت)
          </p>
        </div>
      </Card>

      {/* Students Attendance */}
      {formData.timetableId && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">حضور الطلاب</h3>
          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <StudentAttendanceList
                students={students}
                value={formData.attendances}
                onChange={(attendances) => handleChange('attendances', attendances)}
                disabled={isLoading}
              />
              {errors.attendances && (
                <p className="text-sm text-destructive mt-2">{errors.attendances}</p>
              )}
            </>
          )}
        </Card>
      )}

      {/* General Notes */}
      {formData.timetableId && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ملاحظات عامة</h3>
          <div className="space-y-2">
            <Label htmlFor="generalNotes">ملاحظات عامة للحضور (اختياري)</Label>
            <Textarea
              id="generalNotes"
              value={formData.generalNotes}
              onChange={(e) => handleChange('generalNotes', e.target.value)}
              placeholder="أضف ملاحظات عامة حول حضور هذه الجلسة..."
              disabled={isLoading}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              هذه الملاحظات ستكون مرئية لجميع المستخدمين
            </p>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 ml-1" />
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading || !formData.timetableId}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-1" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

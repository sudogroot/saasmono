'use client'

import { Badge, Button, Card, Input, Label } from '@repo/ui'
import { CheckCircle2, User } from 'lucide-react'
import { useState } from 'react'

interface StudentAttendance {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK'
  note?: string
}

interface Student {
  id: string
  name: string
  lastName: string
}

interface StudentAttendanceListProps {
  students: Student[]
  value: StudentAttendance[]
  onChange: (attendances: StudentAttendance[]) => void
  disabled?: boolean
}

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'حاضر', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'ABSENT', label: 'غائب', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'LATE', label: 'متأخر', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'EXCUSED', label: 'معذور', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'SICK', label: 'مريض', color: 'bg-purple-100 text-purple-800 border-purple-200' },
] as const

export function StudentAttendanceList({
  students,
  value,
  onChange,
  disabled = false,
}: StudentAttendanceListProps) {
  const getStudentAttendance = (studentId: string): StudentAttendance | undefined => {
    return value.find((a) => a.studentId === studentId)
  }

  const updateStudentStatus = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK'
  ) => {
    const existing = value.find((a) => a.studentId === studentId)
    if (existing) {
      onChange(value.map((a) => (a.studentId === studentId ? { ...a, status } : a)))
    } else {
      onChange([...value, { studentId, status }])
    }
  }

  const updateStudentNote = (studentId: string, note: string) => {
    const existing = value.find((a) => a.studentId === studentId)
    if (existing) {
      onChange(value.map((a) => (a.studentId === studentId ? { ...a, note } : a)))
    } else {
      onChange([...value, { studentId, status: 'PRESENT', note }])
    }
  }

  const markAllAs = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK') => {
    onChange(
      students.map((student) => {
        const existing = value.find((a) => a.studentId === student.id)
        return {
          studentId: student.id,
          status,
          note: existing?.note,
        }
      })
    )
  }

  if (students.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <User className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>لا توجد طلاب مسجلين في هذا الفصل أو المجموعة</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">تحديد الكل كـ:</span>
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => markAllAs(option.value)}
              disabled={disabled}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Students List */}
      <div className="space-y-3">
        {students.map((student) => {
          const attendance = getStudentAttendance(student.id)
          const selectedStatus = attendance?.status

          return (
            <Card key={student.id} className="p-4">
              <div className="space-y-3">
                {/* Student Name */}
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                    <User className="text-primary h-4 w-4" />
                  </div>
                  <span className="font-medium">
                    {student.name} {student.lastName}
                  </span>
                  {selectedStatus && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-auto" />
                  )}
                </div>

                {/* Status Buttons */}
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = selectedStatus === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateStudentStatus(student.id, option.value)}
                        disabled={disabled}
                        className={`
                          px-3 py-1.5 rounded-md text-sm font-medium border transition-all
                          ${isSelected ? option.color : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>

                {/* Note Input */}
                <div className="space-y-1">
                  <Label htmlFor={`note-${student.id}`} className="text-xs text-muted-foreground">
                    ملاحظة (اختياري)
                  </Label>
                  <Input
                    id={`note-${student.id}`}
                    value={attendance?.note || ''}
                    onChange={(e) => updateStudentNote(student.id, e.target.value)}
                    placeholder="سبب الغياب أو التأخير..."
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">الملخص:</span>
          <div className="flex gap-4">
            {STATUS_OPTIONS.map((option) => {
              const count = value.filter((a) => a.status === option.value).length
              if (count === 0) return null
              return (
                <div key={option.value} className="flex items-center gap-1">
                  <Badge variant="outline" className={option.color}>
                    {option.label}: {count}
                  </Badge>
                </div>
              )
            })}
          </div>
          <span className="text-muted-foreground mr-auto">
            تم تحديد {value.length} من {students.length} طالب
          </span>
        </div>
      </Card>
    </div>
  )
}

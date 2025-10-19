'use client'

import { EligibleStudentsTable } from '@/components/late-pass-tickets/generate/eligible-students-table'
import { useState } from 'react'

export default function GenerateLatePassTicketPage() {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null)
  const [selectedClassroomGroupId, setSelectedClassroomGroupId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إصدار تذكرة الدخول </h1>
        <p className="text-muted-foreground mt-2">
          اختر الفصل أو المجموعة لعرض الطلاب المؤهلين لإصدار تذاكر الدخول
        </p>
      </div>

      <EligibleStudentsTable
        classroomId={selectedClassroomId}
        classroomGroupId={selectedClassroomGroupId}
        onClassroomChange={setSelectedClassroomId}
        onClassroomGroupChange={setSelectedClassroomGroupId}
      />
    </div>
  )
}

'use client'

import { EligibleStudentsTable } from '@/components/late-pass-tickets/generate/eligible-students-table'
import { Button } from '@repo/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GenerateLatePassTicketPage() {
  const router = useRouter()
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null)
  const [selectedClassroomGroupId, setSelectedClassroomGroupId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إصدار تذكرة الدخول</h1>
          <p className="text-muted-foreground mt-2">
            إصدار تذاكر دخول للطلاب المتغيبين للحصص القادمة
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          رجوع
        </Button>
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

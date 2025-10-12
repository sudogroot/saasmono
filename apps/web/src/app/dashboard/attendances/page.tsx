'use client'

import { AttendanceTable } from '@/components/attendances/attendance-table'
import { useRouter } from 'next/navigation'

export default function AttendancesPage() {
  const router = useRouter()

  const handleCreateNew = () => {
    router.push('/dashboard/attendances/new')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">سجلات الحضور</h1>
        <p className="text-muted-foreground mt-2">
          إدارة وتتبع حضور الطلاب في الجلسات المختلفة
        </p>
      </div>

      <AttendanceTable onCreateNew={handleCreateNew} />
    </div>
  )
}

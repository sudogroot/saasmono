'use client'

import { orpc } from '@/utils/orpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AttendanceForm } from '@/components/attendances/form/attendance-form'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@repo/ui'

export default function CreateAttendancePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    ...orpc.management.attendances.createBulkAttendance.mutationOptions(),
    onSuccess: (data: any) => {
      toast.success('تم إنشاء سجل الحضور بنجاح')
      // Invalidate list query
      queryClient.invalidateQueries({
        queryKey: orpc.management.attendances.getAttendancesList.queryKey({}),
      })
      // Navigate to detail page
      router.push(`/dashboard/attendances/${data.sessionId}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء سجل الحضور')
    },
  })

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync({
      timetableId: data.timetableId,
      generalNotes: data.generalNotes,
      attendances: data.attendances,
    })
  }

  const handleCancel = () => {
    router.push('/dashboard/attendances')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center kustify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة سجل حضور جديد</h1>
          <p className="text-muted-foreground mt-2">
            تسجيل حضور الطلاب لجلسة معينة
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

      <AttendanceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="إنشاء سجل الحضور"
        isLoading={createMutation.isPending}
      />
    </div>
  )
}

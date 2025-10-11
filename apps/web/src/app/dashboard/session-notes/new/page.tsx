'use client'

import { orpc } from '@/utils/orpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SessionNoteForm } from '@/components/sessionNotes/form/session-note-form'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@repo/ui'

export default function CreateSessionNotePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    ...orpc.management.sessionNotes.createSessionNote.mutationOptions(),
    onSuccess: (data: any) => {
      toast.success('تم إنشاء الملاحظة بنجاح')
      // Invalidate list query
      queryClient.invalidateQueries({
        queryKey: orpc.management.sessionNotes.getSessionNotesList.queryKey({}),
      })
      // Navigate to detail page
      router.push(`/dashboard/session-notes/${data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الملاحظة')
    },
  })

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const handleCancel = () => {
    router.push('/dashboard/session-notes')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 ml-1" />
          رجوع
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إضافة ملاحظة جديدة</h1>
          <p className="text-muted-foreground mt-2">
            إنشاء ملاحظة جلسة جديدة باستخدام نموذج كورنيل
          </p>
        </div>
      </div>

      <SessionNoteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="إنشاء الملاحظة"
        isLoading={createMutation.isPending}
      />
    </div>
  )
}

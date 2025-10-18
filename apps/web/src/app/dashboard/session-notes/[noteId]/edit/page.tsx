'use client'

import { orpc } from '@/utils/orpc'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SessionNoteForm } from '@/components/sessionNotes/form/session-note-form'
import { toast } from 'sonner'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@repo/ui'

interface PageProps {
  params: {
    noteId: string
  }
}

export default function EditSessionNotePage({ params }: PageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: sessionNote, isLoading, error } = useQuery(
    orpc.management.sessionNotes.getSessionNoteById.queryOptions({
      input: { sessionNoteId: params.noteId },
    })
  ) as any

  const updateMutation = useMutation({
    ...orpc.management.sessionNotes.updateSessionNote.mutationOptions(),
    onSuccess: () => {
      toast.success('تم تحديث كراس القسم بنجاح')
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: orpc.management.sessionNotes.getSessionNotesList.queryKey({}),
      })
      queryClient.invalidateQueries({
        queryKey: orpc.management.sessionNotes.getSessionNoteById.queryKey({
          input: { sessionNoteId: params.noteId },
        }),
      })
      // Navigate to detail page
      router.push(`/dashboard/session-notes/${params.noteId}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث كراس القسم')
    },
  })

  const handleSubmit = async (data: any) => {
    // Remove timetableId from update data (can't be changed)
    const { timetableId, ...updateData } = data
    await updateMutation.mutateAsync({
      sessionNoteId: params.noteId,
      data: updateData,
    })
  }

  const handleCancel = () => {
    router.push(`/dashboard/session-notes/${params.noteId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !sessionNote) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">خطأ في تحميل كراس القسم</h3>
          <p className="text-muted-foreground">
            {error?.message || 'لم يتم العثور على كراس القسم'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            تعديل كراس القسم: {sessionNote.title}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          رجوع
        </Button>
      </div>

      <SessionNoteForm
        initialData={{
          title: sessionNote.title,
          content: sessionNote.content || '',
          keywords: sessionNote.keywords || '',
          notes: sessionNote.notes || '',
          summary: sessionNote.summary || '',
          isPrivate: sessionNote.isPrivate,
          timetableId: sessionNote.timetableId,
          tempAttachments: [], // New attachments only
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="حفظ التعديلات"
        isLoading={updateMutation.isPending}
      />

      {/* Show existing attachments if any */}
      {sessionNote.attachments && sessionNote.attachments.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">المرفقات الحالية</h3>
          <div className="space-y-2">
            {sessionNote.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span>{attachment.fileName}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            لإضافة مرفقات جديدة، استخدم قسم المرفقات أعلاه
          </p>
        </div>
      )}
    </div>
  )
}

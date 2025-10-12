'use client'

import { orpc } from '@/utils/orpc'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SessionNoteHeader } from '@/components/sessionNotes/detail/session-note-header'
import { CornellLayout } from '@/components/sessionNotes/detail/cornell-layout'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PageProps {
  params: {
    noteId: string
  }
}

export default function SessionNoteDetailPage({ params }: PageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: sessionNote, isLoading, error } = useQuery(
    orpc.management.sessionNotes.getSessionNoteById.queryOptions({
      input: { sessionNoteId: params.noteId },
    })
  ) as any

  const deleteMutation = useMutation({
    ...orpc.management.sessionNotes.deleteSessionNote.mutationOptions(),
    onSuccess: () => {
      toast.success('تم حذف الملاحظة بنجاح')
      // Invalidate list query
      queryClient.invalidateQueries({
        queryKey: orpc.management.sessionNotes.getSessionNotesList.queryKey({}),
      })
      // Navigate back to list
      router.push('/dashboard/session-notes')
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف الملاحظة')
    },
  })

  const handleDelete = () => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      deleteMutation.mutate({ sessionNoteId: params.noteId })
    }
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
          <h3 className="text-lg font-semibold">خطأ في تحميل الملاحظة</h3>
          <p className="text-muted-foreground">
            {error?.message || 'لم يتم العثور على الملاحظة'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SessionNoteHeader
        title={sessionNote.title}
        isPrivate={sessionNote.isPrivate}
        createdAt={sessionNote.createdAt}
        timetable={sessionNote.timetable}
        createdBy={sessionNote.createdBy}
        noteId={params.noteId}
        onDelete={handleDelete}
      />

      <div className="px-6">
        <CornellLayout
          keywords={sessionNote.keywords}
          notes={sessionNote.notes}
          summary={sessionNote.summary}
          attachments={sessionNote.attachments || []}
        />
      </div>
    </div>
  )
}

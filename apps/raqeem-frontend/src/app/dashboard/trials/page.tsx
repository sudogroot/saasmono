'use client'

import { TrialsTable } from '@/components/trials/trials-table'
import { authClient } from '@/lib/auth-client'
import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function TrialsPage() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const [deletingTrialId, setDeletingTrialId] = useState<string | null>(null)

  // Fetch trials data
  const {
    data: trials = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.trials.listTrials.queryOptions(),
    enabled: !!session,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.trials.deleteTrial.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف الجلسة بنجاح')
        setDeletingTrialId(null)
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials.key() })
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ في حذف الجلسة: ${error.message}`)
      },
    }),
  })

  const handleCreateNew = () => {
    globalSheet.openTrialForm({
      mode: 'create',
      slug: 'trials',
      size: 'md',
    })
  }

  const handleDelete = (trialId: string) => {
    setDeletingTrialId(trialId)
  }

  const confirmDelete = () => {
    if (deletingTrialId) {
      deleteMutation.mutate({
        trialId: deletingTrialId,
      })
    }
  }

  return (
    <>
      <div>
        <TrialsTable
          trials={trials}
          isLoading={isLoading}
          error={error}
          onCreateNew={handleCreateNew}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTrialId} onOpenChange={() => setDeletingTrialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الجلسة</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="font-medium text-foreground">
                هل أنت متأكد من أنك تريد حذف هذه الجلسة؟
              </div>
              <div className="text-sm text-muted-foreground">
                لا يمكن التراجع عن هذا الإجراء.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'تأكيد الحذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
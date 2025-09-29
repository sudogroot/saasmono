'use client'

import { OpponentsTable } from '@/components/opponents/opponents-table'
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

export default function OpponentsPage() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const [deletingOpponentId, setDeletingOpponentId] = useState<string | null>(null)

  // Fetch opponents data
  const {
    data: opponents = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.opponents.listOpponents.queryOptions(),
    enabled: !!session,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.opponents.deleteOpponent.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف الخصم بنجاح')
        setDeletingOpponentId(null)
        queryClient.invalidateQueries({ queryKey: orpc.opponents.listOpponents.key() })
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ في حذف الخصم: ${error.message}`)
      },
    }),
  })

  const handleCreateNew = () => {
    globalSheet.openOpponentForm({
      mode: 'create',
      slug: 'opponents',
      size: 'lg',
    })
  }

  const handleDelete = (opponentId: string) => {
    setDeletingOpponentId(opponentId)
  }

  const confirmDelete = () => {
    if (deletingOpponentId) {
      deleteMutation.mutate({
        opponentId: deletingOpponentId,
      })
    }
  }

  return (
    <>
      <div>
        <OpponentsTable
          opponents={opponents}
          isLoading={isLoading}
          error={error}
          onCreateNew={handleCreateNew}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingOpponentId} onOpenChange={() => setDeletingOpponentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الخصم؟ يمكنك استرداده لاحقاً من قسم المحذوفات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
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
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

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

  // Fetch deletion impact when dialog opens
  const { data: deletionImpact, isLoading: isLoadingImpact } = useQuery({
    ...orpc.opponents.getOpponentDeletionImpact.queryOptions({
      input: {
        opponentId: deletingOpponentId!,
      },
    }),
    enabled: !!deletingOpponentId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.opponents.deleteOpponent.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف الخصم بنجاح')
        setDeletingOpponentId(null)
        queryClient.invalidateQueries({ queryKey: orpc.opponents.listOpponents.key() })
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases.key() })
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
            <AlertDialogTitle>تأكيد حذف الخصم</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {isLoadingImpact ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">جاري التحقق من البيانات المرتبطة...</div>
                </div>
              ) : deletionImpact ? (
                <>
                  <div className="font-medium text-foreground">
                    هل أنت متأكد من أنك تريد حذف هذا الخصم؟
                  </div>

                  {deletionImpact.casesCount > 0 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 space-y-3">
                      <div className="font-semibold text-warning text-sm">
                        ⚠️ تنبيه: سيتم إلغاء تعيين هذا الخصم من القضايا التالية:
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">• عدد القضايا: </span>
                        <span>{deletionImpact.casesCount} قضية</span>
                      </div>

                      {deletionImpact.cases.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-warning/20">
                          <div className="text-xs font-medium mb-1">القضايا المتأثرة:</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {deletionImpact.cases.map((caseItem) => (
                              <div key={caseItem.id} className="text-xs">
                                <span className="font-medium">{caseItem.caseNumber}</span> - {caseItem.caseTitle}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground italic">
                        ملاحظة: القضايا لن يتم حذفها، فقط سيتم إزالة الخصم منها.
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    لا يمكن التراجع عن هذا الإجراء.
                  </div>
                </>
              ) : (
                <div>هل أنت متأكد من أنك تريد حذف هذا الخصم؟</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending || isLoadingImpact}
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

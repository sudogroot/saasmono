'use client'

import { ClientsTable } from '@/components/clients/clients-table'
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

export default function ClientsPage() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

  // Fetch clients data
  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.clients.listClients.queryOptions({
      input: {
        includeDeleted: false,
      },
    }),
    enabled: !!session,
  })

  // Fetch deletion impact when dialog opens
  const { data: deletionImpact, isLoading: isLoadingImpact } = useQuery({
    ...orpc.clients.getClientDeletionImpact.queryOptions({
      input: {
        clientId: deletingClientId!,
      },
    }),
    enabled: !!deletingClientId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.clients.deleteClient.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف المنوب بنجاح')
        setDeletingClientId(null)
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ في حذف المنوب: ${error.message}`)
      },
    }),
  })

  const handleCreateNew = () => {
    globalSheet.openClientForm({
      mode: 'create',
      slug: 'clients',
      size: 'md',
    })
  }

  const handleDelete = (clientId: string) => {
    setDeletingClientId(clientId)
  }

  const confirmDelete = () => {
    if (deletingClientId) {
      console.log('Deleting client with ID:', deletingClientId)
      deleteMutation.mutate({
        clientId: deletingClientId,
      })
    }
  }

  return (
    <>
      <div>
        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          error={error}
          onCreateNew={handleCreateNew}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingClientId} onOpenChange={() => setDeletingClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المنوب</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {isLoadingImpact ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">جاري التحقق من البيانات المرتبطة...</div>
                </div>
              ) : deletionImpact ? (
                <>
                  <div className="font-medium text-foreground">
                    هل أنت متأكد من أنك تريد حذف هذا المنوب؟
                  </div>

                  {(deletionImpact.casesCount > 0 || deletionImpact.trialsCount > 0) && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                      <div className="font-semibold text-destructive text-sm">
                        ⚠️ تحذير: سيتم حذف البيانات التالية المرتبطة بهذا المنوب:
                      </div>

                      <div className="text-sm space-y-2">
                        {deletionImpact.casesCount > 0 && (
                          <div>
                            <span className="font-medium">• القضايا: </span>
                            <span>{deletionImpact.casesCount} قضية</span>
                          </div>
                        )}

                        {deletionImpact.trialsCount > 0 && (
                          <div>
                            <span className="font-medium">• الجلسات: </span>
                            <span>{deletionImpact.trialsCount} جلسة</span>
                          </div>
                        )}
                      </div>

                      {deletionImpact.cases.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-destructive/20">
                          <div className="text-xs font-medium mb-1">تفاصيل القضايا:</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {deletionImpact.cases.map((caseItem) => (
                              <div key={caseItem.id} className="text-xs">
                                <span className="font-medium">{caseItem.caseNumber}</span> - {caseItem.caseTitle}
                                {caseItem.trialsCount > 0 && (
                                  <span className="text-muted-foreground mr-1">
                                    ({caseItem.trialsCount} جلسة)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    لا يمكن التراجع عن هذا الإجراء.
                  </div>
                </>
              ) : (
                <div>هل أنت متأكد من أنك تريد حذف هذا المنوب؟</div>
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

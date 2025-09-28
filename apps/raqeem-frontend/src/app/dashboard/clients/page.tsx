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

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.clients.deleteClient.mutationOptions({
      onSuccess: () => {
        toast.success('تم حذف العميل بنجاح')
        setDeletingClientId(null)
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ في حذف العميل: ${error.message}`)
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
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا العميل؟ يمكنك استرداده لاحقاً من قسم المحذوفات.
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

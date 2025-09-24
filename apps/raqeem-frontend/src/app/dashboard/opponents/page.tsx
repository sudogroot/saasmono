"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { OpponentsTable } from "@/components/opponents/opponents-table";
import { globalSheet } from "@/stores/global-sheet-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Opponent } from "@/types";

export default function OpponentsPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [deletingOpponentId, setDeletingOpponentId] = useState<string | null>(null);

  // Fetch opponents data
  const {
    data: opponents = [],
    isLoading,
    error,
  } = useQuery({
    ...orpc.opponents.list.queryOptions({
      input: {
        includeDeleted: false,
      },
    }),
    enabled: !!session,
  });


  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.opponents.softDelete.mutationOptions({
      onSuccess: () => {
        toast.success("تم حذف الخصم بنجاح");
        setDeletingOpponentId(null);
        queryClient.invalidateQueries({ queryKey: orpc.opponents.list.key() });
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ في حذف الخصم: ${error.message}`);
      },
    }),
  });

  const handleCreateNew = () => {
    globalSheet.openOpponentForm({
      mode: 'create',
      slug: 'opponents',
      size: 'lg'
    });
  };

  const handleDelete = (opponentId: string) => {
    setDeletingOpponentId(opponentId);
  };

  const confirmDelete = () => {
    if (deletingOpponentId) {
      deleteMutation.mutate({
        id: deletingOpponentId,
      });
    }
  };


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
                  <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrialForm } from "./trial-form";
import { orpc } from "@/utils/orpc";
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Hash,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { toast } from "sonner";
// Remove unused import - we'll use the trial data from API directly

interface TrialsListProps {
  // Removed caseId since trials now list all trials for organization
}

export function TrialsList({}: TrialsListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrial, setEditingTrial] = useState<any | null>(null);
  const [deletingTrialId, setDeletingTrialId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: trials = [], isLoading } = useQuery({
    ...orpc.trials.listTrials.queryOptions(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.trials.deleteTrial.mutationOptions({
      onSuccess: () => {
        toast.success("تم حذف الجلسة بنجاح");
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials.key() });
        setDeletingTrialId(null);
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`);
      },
    }),
  });

  const handleDelete = (trialId: string) => {
    deleteMutation.mutate({ trialId });
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    setEditingTrial(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {trials.length === 0 ? "لا توجد جلسات" : `${trials.length} جلسة`}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة جلسة
        </Button>
      </div>

      {trials.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لم يتم جدولة أي جلسات بعد</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trials.map((trial) => (
            <Card key={trial.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      الجلسة #{trial.trialNumber}
                    </CardTitle>
                    {trial.courtName && (
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {trial.courtName}
                      </CardDescription>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">فتح القائمة</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTrial(trial)}>
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingTrialId(trial.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(trial.trialDateTime).toLocaleDateString("ar-TN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(trial.trialDateTime).toLocaleTimeString("ar-TN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Trial Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة جلسة جديدة</DialogTitle>
            <DialogDescription>
              إضافة جلسة جديدة للقضية
            </DialogDescription>
          </DialogHeader>
          <TrialForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Trial Dialog */}
      <Dialog open={!!editingTrial} onOpenChange={(open) => !open && setEditingTrial(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الجلسة</DialogTitle>
            <DialogDescription>
              تعديل معلومات الجلسة
            </DialogDescription>
          </DialogHeader>
          {editingTrial && (
            <TrialForm
              initialData={editingTrial}
              trialId={editingTrial.id}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTrial(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTrialId} onOpenChange={(open) => !open && setDeletingTrialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTrialId && handleDelete(deletingTrialId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
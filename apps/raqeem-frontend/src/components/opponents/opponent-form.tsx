"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { Loader2, Save, Users } from "lucide-react";
import type { OpponentData, Opponent } from "@/types";

const opponentFormSchema = z.object({
  name: z.string().min(1, "اسم الخصم مطلوب"),
  opponentType: z.enum(["individual", "company", "institution", "organization", "government", "association"]).default("individual"),
});

type OpponentFormData = z.infer<typeof opponentFormSchema>;

interface OpponentFormProps {
  initialData?: Partial<Opponent>;
  opponentId?: string;
  onSuccess?: (opponent: Opponent) => void;
  onCancel?: () => void;
}

export function OpponentForm({
  initialData,
  opponentId,
  onSuccess,
  onCancel
}: OpponentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!opponentId;
  const queryClient = useQueryClient();

  const form = useForm<OpponentFormData>({
    resolver: zodResolver(opponentFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      opponentType: initialData?.opponentType || "individual",
    },
  });

  const createMutation = useMutation({
    ...orpc.opponents.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("تم إنشاء الخصم بنجاح");
        form.reset();
        queryClient.invalidateQueries({ queryKey: orpc.opponents.list.key() });
        onSuccess?.(data);
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }),
  });

  const updateMutation = useMutation({
    ...orpc.opponents.update.mutationOptions({
      onSuccess: (data) => {
        toast.success("تم تحديث الخصم بنجاح");
        queryClient.invalidateQueries({ queryKey: orpc.opponents.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.opponents.getById.key({ input: { id: opponentId! } }) });
        onSuccess?.(data);
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }),
  });

  const onSubmit = async (data: OpponentFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditing && opponentId) {
        updateMutation.mutate({
          id: opponentId,
          data: {
            ...data,
          },
        });
      } else {
        createMutation.mutate({
          data: {
            ...data,
          },
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الخصم *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم الخصم الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="opponentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الخصم *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الخصم" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">فرد</SelectItem>
                      <SelectItem value="company">شركة</SelectItem>
                      <SelectItem value="institution">مؤسسة</SelectItem>
                      <SelectItem value="organization">منظمة</SelectItem>
                      <SelectItem value="government">حكومي</SelectItem>
                      <SelectItem value="association">جمعية</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                {isEditing ? "جاري التحديث..." : "جاري الحفظ..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-1" />
                {isEditing ? "تحديث الخصم" : "حفظ الخصم"}
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
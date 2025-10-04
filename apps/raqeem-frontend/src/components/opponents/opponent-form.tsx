'use client'

import type { Opponent } from '@/types'
import { orpc } from '@/utils/orpc'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const opponentFormSchema = z.object({
  name: z.string().min(1, 'اسم الخصم مطلوب'),
  opponentType: z
    .enum(['individual', 'company', 'institution', 'organization', 'government', 'association'])
    .default('individual'),
})

type OpponentFormData = z.infer<typeof opponentFormSchema>

interface OpponentFormProps {
  initialData?: Partial<Opponent>
  opponentId?: string
  onSuccess?: (opponent: Opponent) => void
  onCancel?: () => void
}

export function OpponentForm({ initialData, opponentId, onSuccess, onCancel }: OpponentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!opponentId
  const queryClient = useQueryClient()

  const form = useForm<OpponentFormData>({
    resolver: zodResolver(opponentFormSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      opponentType: initialData?.opponentType || 'individual',
    },
  })

  const createMutation = useMutation({
    ...orpc.opponents.createOpponent.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم إنشاء الخصم بنجاح')
        form.reset()
        queryClient.invalidateQueries({ queryKey: orpc.opponents.listOpponents.key() })
        onSuccess?.(data)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
      onSettled: () => {
        setIsSubmitting(false)
      },
    }),
  })

  const updateMutation = useMutation({
    ...orpc.opponents.updateOpponent.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم تحديث الخصم بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.opponents.listOpponents.key() })
        queryClient.invalidateQueries({
          queryKey: orpc.opponents.getOpponentById.key({ input: { opponentId: opponentId! } }),
        })
        onSuccess?.(data)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
      onSettled: () => {
        setIsSubmitting(false)
      },
    }),
  })

  const onSubmit = async (data: OpponentFormData) => {
    setIsSubmitting(true)

    try {
      if (isEditing && opponentId) {
        updateMutation.mutate({
          opponentId: opponentId,
          ...data,
        })
      } else {
        createMutation.mutate({
          ...data,
        })
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
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
              control={form.control as any}
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
              control={form.control as any}
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
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                {isEditing ? 'جاري التحديث...' : 'جاري الحفظ...'}
              </>
            ) : (
              <>
                <Save className="ml-1 h-4 w-4" />
                {isEditing ? 'تحديث الخصم' : 'حفظ الخصم'}
              </>
            )}
          </Button>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              إلغاء
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

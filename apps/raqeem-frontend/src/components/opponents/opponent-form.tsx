'use client'

import type { Opponent } from '@/types'
import { orpc } from '@/utils/orpc'
import { getErrorMessage } from '@/utils/error-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldLabel,
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
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EntityBadge } from '../base/entity-badge'

const opponentFormSchema = z.object({
  name: z.string().min(1, 'اسم الخصم مطلوب'),
  opponentType: z
    .enum(['individual', 'company', 'institution', 'organization', 'government', 'association'], {
      errorMap: () => ({ message: 'نوع الخصم مطلوب' }),
    })
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
    resolver: zodResolver(opponentFormSchema),
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
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage)
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
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage)
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
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>اسم الخصم *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="أدخل اسم الخصم الكامل"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="opponentType"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="opponent-type">نوع الخصم *</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="opponent-type" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="اختر نوع الخصم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual"><EntityBadge type="entityType" value="individual" /></SelectItem>
                      <SelectItem value="company"><EntityBadge type="entityType" value="company" /></SelectItem>
                      <SelectItem value="institution"><EntityBadge type="entityType" value="institution" /></SelectItem>
                      <SelectItem value="organization"><EntityBadge type="entityType" value="organization" /></SelectItem>
                      <SelectItem value="government"><EntityBadge type="entityType" value="government" /></SelectItem>
                      <SelectItem value="association"><EntityBadge type="entityType" value="association" /></SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
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
  )
}

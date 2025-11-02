'use client'

import { orpc } from '@/utils/orpc'
import { getErrorMessage } from '@/utils/error-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge, Button, Field, FieldError, FieldLabel, Heading, Input, SearchSelect } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Calendar, Clock, FileText, Gavel, Loader2, Save, User } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const trialFormSchema = z.object({
  caseId: z.string().min(1, 'يجب اختيار قضية'),
  courtId: z.string().min(1, 'يجب اختيار محكمة'),
  trialDate: z.string().min(1, 'تاريخ الجلسة مطلوب'),
  trialTime: z.string().min(1, 'وقت الجلسة مطلوب'),
})

type TrialFormData = z.infer<typeof trialFormSchema>

interface TrialFormProps {
  initialData?: any
  trialId?: string
  caseId?: string
  presetData?: {
    caseId?: string
    courtId?: string
    [key: string]: any
  }
  onSuccess?: (trial: any) => void
  onCancel?: () => void
}

export function TrialForm({ initialData, trialId, caseId, presetData, onSuccess, onCancel }: TrialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!trialId
  const queryClient = useQueryClient()

  // Parse initial datetime if editing
  const initialDate = initialData?.trialDateTime ? new Date(initialData.trialDateTime).toISOString().split('T')[0] : ''
  const initialTime = initialData?.trialDateTime ? new Date(initialData.trialDateTime).toTimeString().slice(0, 5) : ''

  const form = useForm<TrialFormData>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      caseId: presetData?.caseId || caseId || initialData?.caseId || '',
      courtId: presetData?.courtId || initialData?.courtId || '',
      trialDate: initialDate,
      trialTime: initialTime,
    },
  })

  // Fetch courts for dropdown
  const { data: courts = [] } = useQuery({
    ...orpc.courts.listCourts.queryOptions(),
  })

  // Fetch cases for dropdown
  const { data: cases = [] } = useQuery({
    ...(orpc.cases?.listCases?.queryOptions() || { queryKey: ['cases'], queryFn: () => [] }),
  })

  // Fetch full case details if we have a preset case (to get client info)
  const presetCaseIdValue = presetData?.caseId || caseId
  const { data: presetCaseDetails } = useQuery({
    ...orpc.cases.getCaseById.queryOptions({
      input: {
        caseId: presetCaseIdValue!,
      },
    }),
    enabled: !!presetCaseIdValue,
  })

  const createMutation = useMutation({
    ...orpc.trials.createTrial.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم إنشاء الجلسة بنجاح')
        form.reset()
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials?.key?.() || ['trials'] })
        queryClient.invalidateQueries({ queryKey: orpc.clients.getClientById?.key?.() || ['clients'] })
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases?.key?.() || ['cases'] })
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
    ...orpc.trials.updateTrial.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم تحديث الجلسة بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials?.key?.() || ['trials'] })
        queryClient.invalidateQueries({
          queryKey: orpc.trials.getTrialById?.key?.({ input: { trialId: trialId! } }) || ['trial', trialId],
        })
        queryClient.invalidateQueries({ queryKey: orpc.clients.getClientById?.key?.() || ['clients'] })
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases?.key?.() || ['cases'] })
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

  const onSubmit = async (data: TrialFormData) => {
    setIsSubmitting(true)

    try {
      // Combine date and time into ISO string
      const trialDateTime = new Date(`${data.trialDate}T${data.trialTime}`).toISOString()

      const submitData = {
        caseId: data.caseId,
        courtId: data.courtId,
        trialDateTime,
      }

      if (isEditing && trialId) {
        const { caseId: _, ...updateData } = submitData
        updateMutation.mutate({
          trialId,
          ...updateData,
        })
      } else {
        createMutation.mutate(submitData)
      }
    } catch (error) {
      setIsSubmitting(false)
      toast.error('حدث خطأ في تنسيق التاريخ والوقت')
    }
  }

  // Get preset entity names for display
  const presetCase = presetCaseDetails || cases.find((c: any) => c.id === (presetData?.caseId || caseId))

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
      {/* Preset Context Banner */}
      {presetCase && (
        <div className="bg-primary/5 border-primary/20 -mt-2 mb-4 rounded-lg border px-3 py-3 space-y-2">
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">تم تحديد القضية مسبقاً</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground shrink-0">القضية:</span>
                  <span className="text-sm font-medium truncate">
                    {presetCase.caseNumber} - {presetCase.caseTitle}
                  </span>
                </div>
                {(presetCase as any).client?.name && (
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground shrink-0">العميل:</span>
                    <span className="text-sm truncate">{(presetCase as any).client.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-primary/10 rounded-md px-3 py-2 pr-6">
            <p className="text-sm font-medium text-primary">
              الجلسة ستُضاف لهذه القضية
            </p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="flex gap-2">
        <FileText className="h-5 w-5" />
        <Heading level={5} className="flex">
          معلومات القضية
        </Heading>
      </div>
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="caseId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="case-select">القضية *</FieldLabel>
              <SearchSelect
                value={field.value}
                onValueChange={field.onChange}
                options={cases.map((caseItem: any) => ({
                  id: caseItem.id,
                  label: `${caseItem.caseNumber} - ${caseItem.caseTitle}`,
                  searchLabel: `${caseItem.caseNumber} ${caseItem.caseTitle}`,
                }))}
                placeholder="اختر القضية"
                searchPlaceholder="ابحث عن قضية..."
                emptyMessage="لا توجد قضايا"
                disabled={!!(presetData?.caseId || caseId)}
                clearable={false}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Court Information */}
      <div className="flex gap-2">
        <Gavel className="h-5 w-5" />
        <Heading level={5} className="flex">
          معلومات المحكمة
        </Heading>
      </div>
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="courtId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="court-select">المحكمة *</FieldLabel>
              <SearchSelect
                value={field.value}
                onValueChange={field.onChange}
                options={courts.map((court) => ({
                  id: court.id,
                  label: court.name,
                  metadata: court.state,
                  searchLabel: `${court.name} ${court.state}`,
                }))}
                placeholder="اختر المحكمة"
                searchPlaceholder="ابحث عن محكمة..."
                emptyMessage="لا توجد محاكم"
                clearable={false}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Trial Schedule */}
      <div className="flex gap-2">
        <Calendar className="h-5 w-5" />
        <Heading level={5} className="flex">
          موعد الجلسة
        </Heading>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="trialDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>تاريخ الجلسة *</FieldLabel>
                <div className="relative">
                  <Calendar className="text-muted-foreground absolute top-3 right-3 h-4 w-4" />
                  <Input type="date" {...field} id={field.name} className="pr-10" aria-invalid={fieldState.invalid} />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="trialTime"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>وقت الجلسة *</FieldLabel>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute top-3 right-3 h-4 w-4" />
                  <Input type="time" {...field} id={field.name} className="pr-10" aria-invalid={fieldState.invalid} />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
              {isEditing ? 'جاري التحديث...' : 'جاري الحفظ...'}
            </>
          ) : (
            <>
              <Save className="ml-1 h-4 w-4" />
              {isEditing ? 'تحديث الجلسة' : 'حفظ الجلسة'}
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

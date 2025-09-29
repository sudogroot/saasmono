'use client'

import { orpc } from '@/utils/orpc'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Badge,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Heading,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, FileText, Gavel, Loader2, Save, Briefcase, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const trialFormSchema = z.object({
  caseId: z.string().min(1, 'يجب اختيار قضية'),
  trialNumber: z.number().int().min(1, 'رقم الجلسة مطلوب'),
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
      trialNumber: initialData?.trialNumber || 1,
      courtId: presetData?.courtId || initialData?.courtId || '',
      trialDate: initialDate,
      trialTime: initialTime,
    },
  })

  // Auto-generate trial number
  useEffect(() => {
    if (!isEditing) {
      form.setValue('trialNumber', 1)
    }
  }, [isEditing, form])

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
        toast.error(`حدث خطأ: ${error.message}`)
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
        queryClient.invalidateQueries({ queryKey: orpc.trials.getTrialById?.key?.({ input: { trialId: trialId! } }) || ['trial', trialId] })
        queryClient.invalidateQueries({ queryKey: orpc.clients.getClientById?.key?.() || ['clients'] })
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases?.key?.() || ['cases'] })
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

  const onSubmit = async (data: TrialFormData) => {
    setIsSubmitting(true)

    try {
      // Combine date and time into ISO string
      const trialDateTime = new Date(`${data.trialDate}T${data.trialTime}`).toISOString()

      const submitData = {
        caseId: data.caseId,
        trialNumber: data.trialNumber,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        {/* Preset Context Banner */}
        {presetCase && (
          <div className="bg-muted/50 border-border -mt-2 mb-4 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3">
            <span className="text-muted-foreground text-sm font-medium">إضافة جلسة لـ:</span>
            <Badge variant="secondary" className="gap-1.5">
              <Briefcase className="h-3 w-3" />
              <span>{presetCase.caseNumber} - {presetCase.caseTitle}</span>
            </Badge>
            {(presetCase as any).client?.name && (
              <Badge variant="secondary" className="gap-1.5">
                <User className="h-3 w-3" />
                <span>{(presetCase as any).client.name}</span>
              </Badge>
            )}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القضية *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!(presetData?.caseId || caseId)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القضية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cases.map((caseItem: any) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.caseNumber} - {caseItem.caseTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الجلسة *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="رقم الجلسة"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value || ''}
                      disabled={isEditing}
                      className="font-mono"
                    />
                  </FormControl>
                  {isEditing && <p className="text-muted-foreground text-xs">لا يمكن تعديل رقم الجلسة</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Court Information */}
        <div className="flex gap-2">
          <Gavel className="h-5 w-5" />
          <Heading level={5} className="flex">
            معلومات المحكمة
          </Heading>
        </div>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="courtId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المحكمة *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحكمة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name} - {court.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
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
            <FormField
              control={form.control}
              name="trialDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الجلسة *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="text-muted-foreground absolute top-3 right-3 h-4 w-4" />
                      <Input type="date" {...field} className="pr-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trialTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وقت الجلسة *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="text-muted-foreground absolute top-3 right-3 h-4 w-4" />
                      <Input type="time" {...field} className="pr-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
    </Form>
  )
}

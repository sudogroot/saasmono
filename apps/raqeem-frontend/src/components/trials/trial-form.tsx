'use client'

import { orpc } from '@/utils/orpc'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Loader2, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
// Remove unused import

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
  onSuccess?: (trial: any) => void
  onCancel?: () => void
}

export function TrialForm({ initialData, trialId, caseId, onSuccess, onCancel }: TrialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!trialId
  const queryClient = useQueryClient()

  // Parse initial datetime if editing
  const initialDate = initialData?.trialDateTime ? new Date(initialData.trialDateTime).toISOString().split('T')[0] : ''
  const initialTime = initialData?.trialDateTime ? new Date(initialData.trialDateTime).toTimeString().slice(0, 5) : ''

  const form = useForm<TrialFormData>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      caseId: caseId || initialData?.caseId || '',
      trialNumber: initialData?.trialNumber || 1,
      courtId: initialData?.courtId || '',
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

  const createMutation = useMutation({
    ...orpc.trials.createTrial.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم إنشاء الجلسة بنجاح')
        form.reset()
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials.key() })
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
        queryClient.invalidateQueries({ queryKey: orpc.trials.listTrials.key() })
        queryClient.invalidateQueries({ queryKey: orpc.trials.getTrialById.key({ input: { trialId: trialId! } }) })
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>القضية *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  />
                </FormControl>
                {isEditing && <p className="text-muted-foreground text-xs">لا يمكن تعديل رقم الجلسة</p>}
                <FormMessage />
              </FormItem>
            )}
          />

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

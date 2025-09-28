'use client'

import { orpc } from '@/utils/orpc'
import {
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
  Textarea,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Gavel, Loader2, Save, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const caseFormSchema = z.object({
  caseNumber: z.string().min(1, 'رقم القضية مطلوب'),
  caseTitle: z.string().min(1, 'عنوان القضية مطلوب'),
  caseSubject: z.string().min(1, 'موضوع القضية مطلوب'),
  clientId: z.string().min(1, 'يجب اختيار عميل'),
  opponentId: z.string().optional(),
  courtId: z.string().optional(),
  courtFileNumber: z.string().optional(),
  caseStatus: z
    .enum([
      'new',
      'under-review',
      'filed-to-court',
      'under-consideration',
      'won',
      'lost',
      'postponed',
      'closed',
      'withdrawn',
      'suspended',
    ])
    .default('new'),
  priority: z.enum(['low', 'normal', 'medium', 'high', 'urgent', 'critical']).default('medium'),
})

// type CaseFormData = z.infer<typeof caseFormSchema>

interface CaseFormProps {
  initialData?: Partial<any>
  caseId?: string
  onSuccess?: (case_: any) => void
  onCancel?: () => void
}

export function CaseForm({ initialData, caseId, onSuccess, onCancel }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!caseId
  const queryClient = useQueryClient()

  const form = useForm({
    // resolver: zodResolver(caseFormSchema),
    defaultValues: {
      caseNumber: initialData?.caseNumber || '',
      caseTitle: initialData?.caseTitle || '',
      caseSubject: initialData?.caseSubject || '',
      clientId: initialData?.clientId || '',
      opponentId: initialData?.opponentId || '',
      courtId: initialData?.courtId || '',
      courtFileNumber: initialData?.courtFileNumber || '',
      caseStatus: initialData?.caseStatus || 'new',
      priority: initialData?.priority || 'medium',
    },
  })

  // // Fetch clients for dropdown
  // const { data: clients = [] } = useQuery({
  //   ...orpc.clients.listClients.queryOptions({
  //     input: { includeDeleted: false },
  //   }),
  // })

  // Fetch opponents for dropdown - disabled until API is available
  // const { data: opponents = [] } = useQuery({
  //   queryKey: ['opponents'],
  //   queryFn: () => Promise.resolve([]),
  //   enabled: false, // Disable until opponents API is implemented
  // })

  // // Fetch courts for dropdown - disabled until API is available
  // const { data: courts = [] } = useQuery({
  //   queryKey: ['courts'],
  //   queryFn: () => Promise.resolve([]),
  //   enabled: false, // Disable until courts API is implemented
  // })

  const createMutation = useMutation(
    orpc.cases.createCase.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم إنشاء القضية بنجاح')
        form.reset()
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases?.key?.() || ['cases'] })
        onSuccess?.(data)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
      onSettled: () => {
        setIsSubmitting(false)
      },
    })
  )

  const updateMutation = useMutation(
    orpc.cases.updateCase.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم تحديث القضية بنجاح')
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases?.key?.() || ['cases'] })
        queryClient.invalidateQueries({
          queryKey: orpc.cases.getCaseById?.key?.({ input: { caseId: caseId! } }) || ['case', caseId],
        })
        onSuccess?.(data)
      },
      onError: (error: any) => {
        toast.error(`حدث خطأ: ${error.message}`)
      },
      onSettled: () => {
        setIsSubmitting(false)
      },
    })
  )

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        opponentId: data.opponentId === 'none' ? undefined : data.opponentId || undefined,
        courtId: data.courtId === 'none' ? undefined : data.courtId || undefined,
        courtFileNumber: data.courtFileNumber || undefined,
      }

      if (isEditing && caseId) {
        // For editing, exclude caseNumber as it shouldn't be updatable
        const { caseNumber, ...updateData } = submitData
        updateMutation.mutate({
          caseId: caseId,
          ...updateData,
        })
      } else {
        createMutation.mutate(submitData)
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        {/* Basic Information */}
        <div className="flex gap-2">
          <FileText className="h-5 w-5" />
          <Heading level={5} className="flex">
            المعلومات الأساسية
          </Heading>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم القضية *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل رقم القضية" {...field} disabled={isEditing} className="font-mono" />
                  </FormControl>
                  {isEditing && <p className="text-muted-foreground text-xs">لا يمكن تعديل رقم القضية</p>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courtFileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الملف بالمحكمة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل رقم الملف بالمحكمة" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="caseTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان القضية *</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل عنوان القضية" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caseSubject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>موضوع القضية *</FormLabel>
                <FormControl>
                  <Textarea placeholder="اشرح موضوع القضية بالتفصيل" {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="caseStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة القضية *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة القضية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="under-review">قيد المراجعة</SelectItem>
                      <SelectItem value="filed-to-court">مرفوعة للمحكمة</SelectItem>
                      <SelectItem value="under-consideration">قيد النظر</SelectItem>
                      <SelectItem value="won">كسبت</SelectItem>
                      <SelectItem value="lost">خسرت</SelectItem>
                      <SelectItem value="postponed">مؤجلة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                      <SelectItem value="withdrawn">منسحبة</SelectItem>
                      <SelectItem value="suspended">معلقة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الأولوية *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الأولوية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="normal">عادية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                      <SelectItem value="critical">حرجة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Users className="h-5 w-5" />
          <Heading level={5} className="flex">
            الأطراف
          </Heading>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العميل *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                    </FormControl>
                    {/*<SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>*/}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="opponentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الخصم</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الخصم (اختياري)" />
                      </SelectTrigger>
                    </FormControl>
                    {/*<SelectContent>*/}
                    {/*<SelectItem value="none">بدون خصم</SelectItem>
                      {opponents.map((opponent) => (
                        <SelectItem key={opponent.id} value={opponent.id}>
                          {opponent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>*/}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
                <FormLabel>المحكمة</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحكمة (اختياري)" />
                    </SelectTrigger>
                  </FormControl>
                  {/*<SelectContent>
                    <SelectItem value="none">بدون محكمة</SelectItem>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name} - {court.state}
                      </SelectItem>
                    ))}
                  </SelectContent>*/}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
                {isEditing ? 'تحديث القضية' : 'حفظ القضية'}
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

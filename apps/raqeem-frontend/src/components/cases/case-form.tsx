'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { useSheetFormState } from '@/stores/sheet-form-state-store'
import { orpc } from '@/utils/orpc'
import {
  Badge,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Heading,
  Input,
  SearchSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Gavel, Loader2, Save, Scale, User, UserX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EntityBadge } from '../base/entity-badge'

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
  presetData?: {
    clientId?: string
    opponentId?: string
    courtId?: string
    [key: string]: any
  }
  onSuccess?: (case_: any) => void
  onCancel?: () => void
}

export function CaseForm({ initialData, caseId, presetData, onSuccess, onCancel }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!caseId
  const queryClient = useQueryClient()
  const { saveFormState, getFormState, clearFormState } = useSheetFormState()

  // Unique key for storing this form's state
  const formStateKey = `case-form-${caseId || 'new'}`

  // Check if we have saved state to restore
  const savedFormState = getFormState(formStateKey)

  // Fetch case data when editing
  const { data: caseData, isLoading: isCaseLoading } = useQuery({
    ...orpc.cases.getCaseById.queryOptions({
      input: {
        caseId: caseId!,
      },
    }),
    enabled: isEditing && !initialData, // Only fetch if editing and no initialData provided
  })

  const form = useForm({
    // resolver: zodResolver(caseFormSchema),
    defaultValues: savedFormState || {
      caseNumber: initialData?.caseNumber || '',
      caseTitle: initialData?.caseTitle || '',
      caseSubject: initialData?.caseSubject || '',
      clientId: presetData?.clientId || initialData?.clientId || '',
      opponentId: presetData?.opponentId || initialData?.opponentId || '',
      courtId: presetData?.courtId || initialData?.courtId || '',
      courtFileNumber: initialData?.courtFileNumber || '',
      caseStatus: initialData?.caseStatus || 'new',
      priority: initialData?.priority || 'medium',
    },
  })

  // Restore saved form state when component mounts (if available)
  // OR load fetched case data when editing
  useEffect(() => {
    if (savedFormState) {
      form.reset(savedFormState)
    } else if (caseData && isEditing) {
      // Populate form with fetched case data
      form.reset({
        caseNumber: caseData.caseNumber || '',
        caseTitle: caseData.caseTitle || '',
        caseSubject: caseData.caseSubject || '',
        clientId: caseData.clientId || '',
        opponentId: caseData.opponentId || '',
        courtId: caseData.courtId || '',
        courtFileNumber: caseData.courtFileNumber || '',
        caseStatus: caseData.caseStatus || 'new',
        priority: caseData.priority || 'medium',
      })
    }
  }, [caseData, savedFormState, isEditing])

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    ...orpc.clients.getClientsForDropdown.queryOptions(),
  })

  // Fetch opponents for dropdown
  const { data: opponents = [] } = useQuery({
    ...orpc.opponents.getOpponentsForDropdown.queryOptions(),
  })

  // Fetch courts for dropdown (grouped by state)
  const { data: courtsByState = [] } = useQuery({
    ...orpc.courts.getCourtsForDropdown.queryOptions(),
  })

  const createMutation = useMutation(
    orpc.cases.createCase.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم إنشاء القضية بنجاح')
        form.reset()
        clearFormState(formStateKey) // Clear saved state after successful submission
        // Invalidate all case list queries
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases.key() })

        // If onSuccess callback is provided, call it
        if (onSuccess) {
          onSuccess(data)
        } else {
          // Default behavior: Replace form sheet with case details
          globalSheet.openCaseDetails({
            slug: 'cases',
            caseId: data.id,
            size: 'lg',
            reset: true,
          })
        }
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
        clearFormState(formStateKey) // Clear saved state after successful submission
        // Invalidate all case list queries
        queryClient.invalidateQueries({ queryKey: orpc.cases.listCases.key() })
        // Invalidate all case details queries
        queryClient.invalidateQueries({ queryKey: orpc.cases.getCaseById.key() })

        // If onSuccess callback is provided, call it
        if (onSuccess) {
          onSuccess(data)
        } else {
          // Default behavior: Replace form sheet with case details
          globalSheet.openCaseDetails({
            slug: 'cases',
            caseId: data.id,
            size: 'md',
            reset: true,
          })
        }
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

  // Get preset entity names for display
  const presetClient = clients.find((c) => c.id === presetData?.clientId)
  const presetOpponent = opponents.find((o) => o.id === presetData?.opponentId)
  const courtsByStateFlat = courtsByState.flatMap((group) => group.courts)
  const presetCourt = courtsByStateFlat.find((c) => c.id === presetData?.courtId)

  // Show loading state while fetching case data for editing
  if (isEditing && isCaseLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="ml-2 h-6 w-6 animate-spin" />
        <span>جاري تحميل بيانات القضية...</span>
      </div>
    )
  }

  return (
    <>
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>This appears on invoices and emails.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
            <FieldDescription>This appears on invoices and emails.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" autoComplete="off" aria-invalid />
            <FieldError>Choose another username.</FieldError>
          </Field>
          <Field orientation="horizontal">
            <Switch id="newsletter" />
            <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
          {/* Preset Context Banner */}
          {(presetClient || presetOpponent || presetCourt) && (
            <div className="bg-muted/50 border-border -mt-2 mb-4 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3">
              <span className="text-muted-foreground text-sm font-medium">إضافة قضية لـ:</span>
              {presetClient && (
                <Badge variant="secondary" className="gap-1.5">
                  <User className="h-3 w-3" />
                  <span>{presetClient.name}</span>
                </Badge>
              )}
              {presetOpponent && (
                <Badge variant="secondary" className="gap-1.5">
                  <UserX className="h-3 w-3" />
                  <span>ضد: {presetOpponent.name}</span>
                </Badge>
              )}
              {presetCourt && (
                <Badge variant="secondary" className="gap-1.5">
                  <Scale className="h-3 w-3" />
                  <span>{presetCourt.name}</span>
                </Badge>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="flex gap-2">
            <FileText className="h-5 w-5" />
            <Heading level={5} className="flex">
              المعلومات الأساسية
            </Heading>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/*<FormField
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
            />*/}

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
                        <SelectItem value="new">
                          <EntityBadge type="caseStatus" value="new" />
                        </SelectItem>
                        <SelectItem value="under-review">
                          <EntityBadge type="caseStatus" value="under-review" />
                        </SelectItem>
                        <SelectItem value="filed-to-court">
                          <EntityBadge type="caseStatus" value="filed-to-court" />
                        </SelectItem>
                        <SelectItem value="under-consideration">
                          <EntityBadge type="caseStatus" value="under-consideration" />
                        </SelectItem>
                        <SelectItem value="won">
                          <EntityBadge type="caseStatus" value="won" />
                        </SelectItem>
                        <SelectItem value="lost">
                          <EntityBadge type="caseStatus" value="lost" />
                        </SelectItem>
                        <SelectItem value="postponed">
                          <EntityBadge type="caseStatus" value="postponed" />
                        </SelectItem>
                        <SelectItem value="closed">
                          <EntityBadge type="caseStatus" value="closed" />
                        </SelectItem>
                        <SelectItem value="withdrawn">
                          <EntityBadge type="caseStatus" value="withdrawn" />
                        </SelectItem>
                        <SelectItem value="suspended">
                          <EntityBadge type="caseStatus" value="suspended" />
                        </SelectItem>
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
                        <SelectItem value="low">
                          <EntityBadge type="priority" value="low" />
                        </SelectItem>
                        <SelectItem value="normal">
                          <EntityBadge type="priority" value="normal" />
                        </SelectItem>
                        <SelectItem value="medium">
                          <EntityBadge type="priority" value="medium" />
                        </SelectItem>
                        <SelectItem value="high">
                          <EntityBadge type="priority" value="high" />
                        </SelectItem>
                        <SelectItem value="urgent">
                          <EntityBadge type="priority" value="urgent" />
                        </SelectItem>
                        <SelectItem value="critical">
                          <EntityBadge type="priority" value="critical" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <User className="h-5 w-5" />
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
                    <FormControl>
                      <SearchSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={clients.map((client) => ({
                          id: client.id,
                          label: client.name,
                          metadata: client.clientType,
                        }))}
                        placeholder="اختر العميل"
                        searchPlaceholder="ابحث عن عميل..."
                        emptyMessage="لا يوجد عملاء"
                        disabled={!!presetData?.clientId}
                        clearable={true}
                        allowCreate={true}
                        createLabel="إضافة عميل جديد"
                        onCreateClick={(searchValue) => {
                          // Save current form state before navigating
                          saveFormState(formStateKey, form.getValues())

                          globalSheet.openClientForm({
                            mode: 'create',
                            slug: 'clients',
                            size: 'md',
                            initialData: {
                              name: searchValue,
                            },
                            onSuccess: async (createdClient: any) => {
                              // Wait for queries to refetch so the new client appears in the dropdown
                              await queryClient.refetchQueries({
                                queryKey: orpc.clients.getClientsForDropdown.key(),
                              })

                              // Get the saved form state and update with new client
                              const savedState = getFormState(formStateKey)
                              if (savedState) {
                                saveFormState(formStateKey, {
                                  ...savedState,
                                  clientId: createdClient.id,
                                })
                              }

                              // Close the client form sheet and return to case form
                              globalSheet.back()
                            },
                          })
                        }}
                      />
                    </FormControl>
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
                    <FormControl>
                      <SearchSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={opponents.map((opponent) => ({
                          id: opponent.id,
                          label: opponent.name,
                          metadata: opponent.opponentType,
                        }))}
                        placeholder="اختر الخصم (اختياري)"
                        searchPlaceholder="ابحث عن خصم..."
                        emptyMessage="لا يوجد خصوم"
                        disabled={!!presetData?.opponentId}
                        clearable={true}
                        allowNone={true}
                        noneLabel="بدون خصم"
                        allowCreate={true}
                        createLabel="إضافة خصم جديد"
                        onCreateClick={(searchValue) => {
                          // Save current form state before navigating
                          saveFormState(formStateKey, form.getValues())

                          globalSheet.openOpponentForm({
                            mode: 'create',
                            slug: 'opponents',
                            size: 'md',
                            initialData: {
                              name: searchValue,
                            },
                            onSuccess: async (createdOpponent: any) => {
                              // Wait for queries to refetch so the new opponent appears in the dropdown
                              await queryClient.refetchQueries({
                                queryKey: orpc.opponents.getOpponentsForDropdown.key(),
                              })

                              // Get the saved form state and update with new opponent
                              const savedState = getFormState(formStateKey)
                              if (savedState) {
                                saveFormState(formStateKey, {
                                  ...savedState,
                                  opponentId: createdOpponent.id,
                                })
                              }

                              // Close the opponent form sheet and return to case form
                              globalSheet.back()
                            },
                          })
                        }}
                      />
                    </FormControl>
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
                  <FormControl>
                    <SearchSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      groups={courtsByState.map((stateGroup) => ({
                        groupLabel: stateGroup.state,
                        options: stateGroup.courts.map((court) => ({
                          id: court.id,
                          label: court.name,
                        })),
                      }))}
                      placeholder="اختر المحكمة (اختياري)"
                      searchPlaceholder="ابحث عن محكمة..."
                      emptyMessage="لا توجد محاكم"
                      disabled={!!presetData?.courtId}
                      clearable={true}
                      allowNone={true}
                      noneLabel="بدون محكمة"
                    />
                  </FormControl>
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
    </>
  )
}

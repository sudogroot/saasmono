'use client'

import { Button, Heading, Input } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { globalSheet } from '@/stores/global-sheet-store'
// import type { ClientData, Client } from '../../../../server/src/types/clients';
import { orpc } from '@/utils/orpc'
import {
  Field,
  FieldError,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { Loader2, Phone, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { EntityBadge } from '../base/entity-badge'

interface ClientFormProps {
  initialData?: Partial<any> // client type
  clientId?: string
  onSuccess?: (client: any) => void
  onCancel?: () => void
}

export function ClientForm({ initialData, clientId, onSuccess, onCancel }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!clientId
  const queryClient = useQueryClient()

  const form = useForm({
    // resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      nationalId: initialData?.nationalId || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      clientType: initialData?.clientType || 'individual',
    },
  })

  const createMutation = useMutation(
    orpc.clients.createClient.mutationOptions({
      onSuccess: (data) => {
        console.log('Creating toast...')
        toast.success('تم إنشاء العميل بنجاح')
        console.log('Toast created')
        form.reset()
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })

        // If onSuccess callback is provided, call it and let parent handle navigation
        // Otherwise, navigate to client details by default
        if (onSuccess) {
          onSuccess(data)
        } else {
          globalSheet.openClientDetails({
            slug: 'clients',
            clientId: data.id,
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

  const updateMutation = useMutation(
    orpc.clients.updateClient.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم تحديث العميل بنجاح')
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })
        queryClient.invalidateQueries({
          queryKey: orpc.clients.getClientById.key({ input: { clientId: clientId! } }),
        })

        // If onSuccess callback is provided, call it and let parent handle navigation
        // Otherwise, navigate to client details by default
        if (onSuccess) {
          onSuccess(data)
        } else {
          globalSheet.openClientDetails({
            slug: 'clients',
            clientId: data.id,
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
      if (isEditing && clientId) {
        updateMutation.mutate({
          clientId: clientId,
          ...data,
          // Remove empty strings to avoid validation issues
          email: data.email || undefined,
          nationalId: data.nationalId || undefined,
          phone: data.phone || undefined,
        })
      } else {
        createMutation.mutate({
          ...data,
          // Remove empty strings to avoid validation issues
          email: data.email || undefined,
          nationalId: data.nationalId || undefined,
          phone: data.phone || undefined,
        })
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  }

  return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        {/* Basic Information */}
        <div className="flex gap-2">
          <User className="h-5 w-5" />
          <Heading level={5} className="flex">
            المعلومات الأساسية
          </Heading>
        </div>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>اسم العميل *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="أدخل اسم العميل الكامل"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="clientType"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="client-type">نوع العميل *</FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="client-type" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="اختر نوع العميل" />
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
          <Controller
            control={form.control}
            name="nationalId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>رقم الهوية</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="أدخل رقم الهوية"
                  className="font-mono"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Phone className="h-5 w-5" />
          <Heading level={5} className="flex">
            معلومات الاتصال
          </Heading>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>رقم الهاتف</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="أدخل رقم الهاتف"
                  className="font-mono"
                  type="tel"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>البريد الإلكتروني</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="أدخل البريد الإلكتروني"
                  type="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
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
                {isEditing ? 'تحديث العميل' : 'حفظ العميل'}
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

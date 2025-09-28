'use client'

import { Button, Heading, Input } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { globalSheet } from '@/stores/global-sheet-store'
// import type { ClientData, Client } from '../../../../server/src/types/clients';
import { orpc } from '@/utils/orpc'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { Loader2, Phone, Save, User } from 'lucide-react'
import { toast } from 'sonner'

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
        toast.success('تم إنشاء العميل بنجاح')
        form.reset()
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })
        globalSheet.openClientDetails({
          slug: 'clients',
          clientId: data.id,
          size: 'md',
          reset: true,
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

  const updateMutation = useMutation(
    orpc.clients.updateClient.mutationOptions({
      onSuccess: (data) => {
        toast.success('تم تحديث العميل بنجاح')
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: orpc.clients.listClients.key() })
        queryClient.invalidateQueries({
          queryKey: orpc.clients.getClientById.key({ input: { clientId: clientId! } }),
        })
        globalSheet.openClientDetails({
          slug: 'clients',
          clientId: data.id,
          size: 'md',
          reset: true,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        {/* Basic Information */}
        <div className="flex gap-2">
          <User className="h-5 w-5" />
          <Heading level={5} className="flex">
            المعلومات الأساسية
          </Heading>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم العميل *</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم العميل الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="clientType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع العميل *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العميل" />
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
          <FormField
            control={form.control}
            name="nationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهوية</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم الهوية" {...field} className="font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم الهاتف" {...field} className="font-mono" type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل البريد الإلكتروني" {...field} type="email" />
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
    </Form>
  )
}

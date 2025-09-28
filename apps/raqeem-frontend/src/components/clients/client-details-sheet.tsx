'use client'

import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import { Badge, Separator, Text, ValueText } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Mail, Phone, User } from 'lucide-react'

interface ClientDetailsSheetProps {
  clientId: string
  organizationId?: string
  renderMode?: 'content' | 'full'
}

const clientTypeColors = {
  individual: 'bg-blue-50 text-blue-700 border-blue-200',
  company: 'bg-green-50 text-green-700 border-green-200',
  institution: 'bg-purple-50 text-purple-700 border-purple-200',
  organization: 'bg-orange-50 text-orange-700 border-orange-200',
  government: 'bg-gray-50 text-gray-700 border-gray-200',
  association: 'bg-indigo-50 text-indigo-700 border-indigo-200',
} as const

const clientTypeLabels = {
  individual: 'فرد',
  company: 'شركة',
  institution: 'مؤسسة',
  organization: 'منظمة',
  government: 'حكومي',
  association: 'جمعية',
} as const

export function ClientDetails({ clientId, organizationId, renderMode = 'content' }: ClientDetailsSheetProps) {
  const {
    data: clientData,
    isLoading,
    error,
  } = useQuery({
    ...orpc.clients.getClientById.queryOptions({
      input: {
        clientId: clientId,
        includeDeleted: false,
      },
    }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="ml-2 h-6 w-6 animate-spin" />
        <span>جاري تحميل بيانات العميل...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center justify-center py-8">
        <AlertCircle className="ml-2 h-5 w-5" />
        <span>حدث خطأ في تحميل البيانات</span>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-8">
        <span>لم يتم العثور على العميل</span>
      </div>
    )
  }

  const handleEdit = () => {
    globalSheet.openClientForm({
      mode: 'edit',
      slug: 'clients',
      clientId: clientData.id,
      initialData: clientData,
      size: 'md',
    })
  }

  const handleAddCase = () => {
    globalSheet.openCaseForm({
      mode: 'create',
      slug: 'cases',
      clientId: clientData.id,
      size: 'md',
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-sm font-medium">معلومات المنوب الأساسية</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">الاسم و الصفة</span>
            </div>

            <div className="flex gap-4">
              <Badge
                variant="outline"
                className={cn('w-fit', clientTypeColors[clientData.clientType as keyof typeof clientTypeColors])}
              >
                {clientTypeLabels[clientData.clientType as keyof typeof clientTypeLabels]}
              </Badge>
              <div>
                <Text size="sm" weight="semibold" as="span">{clientData.name}</Text>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">البريد الإلكتروني</span>
            </div>
            <ValueText value={clientData.email} size="sm" className="font-medium" fallbackText="غير محدد" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">رقم الهاتف</span>
            </div>
            <ValueText value={clientData.phone} size="sm" className="font-medium" fallbackText="غير محدد" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">رقم الهوية</span>
            </div>
            <ValueText value={clientData.nationalId} size="sm" className="font-medium" fallbackText="غير محدد" />
          </div>
        </div>
      </div>
      {/* Header */}
      {/*<div className="flex flex-col items-start gap-4 sm:flex-row">
        <ClientAvatar client={clientData} size="lg" />
        <div className="flex-1 space-y-2">
          <div>
            <h2 className="text-foreground text-2xl font-bold">{clientData.name}</h2>
          </div>
          <Badge
            variant="outline"
            className={cn('w-fit', clientTypeColors[clientData.clientType as keyof typeof clientTypeColors])}
          >
            {clientTypeLabels[clientData.clientType as keyof typeof clientTypeLabels]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="ml-1 h-4 w-4" />
            تعديل
          </Button>
          <Button variant="default" size="sm" onClick={handleAddCase}>
            <Plus className="ml-1 h-4 w-4" />
            إضافة قضية
          </Button>
        </div>
      </div>*/}

      <Separator />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">تاريخ الإضافة</p>
            <Text size="sm">
              {new Date(clientData.createdAt).toLocaleDateString('ar-TN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>

          <div>
            <p className="text-muted-foreground">آخر تحديث</p>
            <Text size="sm">
              {new Date(clientData.updatedAt).toLocaleDateString('ar-TN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

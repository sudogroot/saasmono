'use client'

import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/ui'
import { Separator } from '@repo/ui'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { orpc } from '@/utils/orpc'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Calendar, Eye, Loader2, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { ClientAvatar } from './client-avatar'

interface ClientDetailsProps {
  clientId: string
  organizationId?: string
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary'
  buttonSize?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  trigger?: React.ReactNode
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

export function ClientDetails({
  clientId,
  organizationId,
  buttonVariant = 'ghost',
  buttonSize = 'sm',
  className,
  showText = false,
  trigger,
}: ClientDetailsProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

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
    enabled: open,
  })

  const defaultTrigger = (
    <Button variant={buttonVariant} size={buttonSize} className={cn('', className)}>
      <Eye className="h-4 w-4" />
      {showText && <span className="mr-1">عرض</span>}
    </Button>
  )

  const triggerElement = trigger || defaultTrigger

  const content = (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="ml-2 h-6 w-6 animate-spin" />
          <span>جاري تحميل بيانات العميل...</span>
        </div>
      )}

      {error && (
        <div className="text-destructive flex items-center justify-center py-8">
          <AlertCircle className="ml-2 h-5 w-5" />
          <span>حدث خطأ في تحميل البيانات</span>
        </div>
      )}

      {clientData && (
        <>
          {/* Header */}
          <div className="flex items-start gap-4">
            <ClientAvatar client={clientData} size="xl" />
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
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              المعلومات الأساسية
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {clientData.nationalId && (
                <div className="space-y-1">
                  <label className="text-muted-foreground text-sm font-medium">رقم الهوية</label>
                  <p className="text-foreground font-mono">{clientData.nationalId}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-muted-foreground text-sm font-medium">نوع العميل</label>
                <p className="text-foreground">
                  {clientTypeLabels[clientData.clientType as keyof typeof clientTypeLabels]}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(clientData.phone || clientData.email) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Phone className="h-5 w-5" />
                  معلومات الاتصال
                </h3>

                <div className="space-y-3">
                  {clientData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">رقم الهاتف</p>
                        <p className="text-foreground font-mono">{clientData.phone}</p>
                      </div>
                    </div>
                  )}

                  {clientData.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">البريد الإلكتروني</p>
                        <p className="text-foreground break-all">{clientData.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5" />
              التواريخ
            </h3>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-muted-foreground">تاريخ الإضافة</p>
                <p className="text-foreground">
                  {new Date(clientData.createdAt).toLocaleDateString('ar-TN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">آخر تحديث</p>
                <p className="text-foreground">
                  {new Date(clientData.updatedAt).toLocaleDateString('ar-TN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
            <DialogDescription>عرض جميع المعلومات المتعلقة بالعميل</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>تفاصيل العميل</DrawerTitle>
          <DrawerDescription>عرض جميع المعلومات المتعلقة بالعميل</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}

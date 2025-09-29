'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge, Button, Separator } from '@repo/ui'
import { orpc } from '@/utils/orpc'
import { globalSheet } from '@/stores/global-sheet-store'
import {
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Edit,
  Gavel,
  Users,
  User,
  UserX,
  Briefcase,
  MapPin,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface TrialDetailsSheetProps {
  trialId: string
  renderMode?: 'content' | 'full'
}

export function TrialDetails({ trialId, renderMode = 'content' }: TrialDetailsSheetProps) {
  const { data: trialData, isLoading, error } = useQuery({
    ...orpc.trials.getTrialById.queryOptions({
      input: {
        trialId: trialId,
      },
    }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="ml-2 h-6 w-6 animate-spin" />
        <span>جاري تحميل بيانات الجلسة...</span>
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

  if (!trialData) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-8">
        <span>لم يتم العثور على الجلسة</span>
      </div>
    )
  }

  const handleEdit = () => {
    globalSheet.openTrialForm({
      mode: 'edit',
      slug: 'trials',
      trialId: trialData.id,
      size: 'md',
    })
  }

  const handleViewCase = () => {
    globalSheet.openCaseDetails({
      slug: 'cases',
      caseId: trialData.case.id,
      size: 'lg',
    })
  }

  const handleViewClient = () => {
    globalSheet.openClientDetails({
      slug: 'clients',
      clientId: trialData.client.id,
      size: 'lg',
      reset: false,
    })
  }

  const trialDate = new Date(trialData.trialDateTime)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <span className="text-lg font-bold">#{trialData.trialNumber}</span>
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-bold">الجلسة رقم {trialData.trialNumber}</h2>
              <p className="text-muted-foreground text-sm">معلومات الجلسة والأطراف المعنية</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="ml-1 h-4 w-4" />
            تعديل
          </Button>
        </div>
      </div>

      <Separator />

      {/* Date and Time */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5" />
          موعد الجلسة
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">التاريخ</p>
            <p className="flex items-center gap-2 font-medium">
              <Calendar className="text-primary h-4 w-4" />
              {format(trialDate, 'EEEE، dd MMMM yyyy', { locale: ar })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">الوقت</p>
            <p className="flex items-center gap-2 font-medium">
              <Clock className="text-primary h-4 w-4" />
              {format(trialDate, 'hh:mm a', { locale: ar })}
            </p>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Briefcase className="h-5 w-5" />
          معلومات القضية
        </h3>

        <div className="border-border bg-card rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Hash className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">رقم القضية</span>
              </div>
              <p className="font-mono text-lg font-semibold">{trialData.case.caseNumber}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleViewCase}>
              عرض التفاصيل
            </Button>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-sm">عنوان القضية</div>
            <p className="font-medium">{trialData.case.caseTitle}</p>
          </div>
        </div>
      </div>

      {/* Court Information */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Gavel className="h-5 w-5" />
          معلومات المحكمة
        </h3>

        <div className="border-border bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground mb-1 text-sm">اسم المحكمة</div>
            <p className="font-medium">{trialData.court.name}</p>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-sm">الولاية</div>
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="text-muted-foreground h-4 w-4" />
              {trialData.court.state}
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="text-muted-foreground mb-1 text-sm">نوع المحكمة</div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {trialData.court.courtType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5" />
          العميل
        </h3>

        <div className="border-border bg-card rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-2 text-lg font-semibold">{trialData.client.name}</p>
              <div className="text-muted-foreground space-y-1 text-sm">
                {trialData.client.email && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">البريد:</span>
                    {trialData.client.email}
                  </p>
                )}
                {trialData.client.phone && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">الهاتف:</span>
                    {trialData.client.phone}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleViewClient}>
              عرض التفاصيل
            </Button>
          </div>
        </div>
      </div>

      {/* Assigned Lawyer */}
      {trialData.assignedLawyer && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5" />
            المحامي المكلف
          </h3>

          <div className="border-border bg-card rounded-lg border p-4">
            <p className="mb-1 text-lg font-semibold">{trialData.assignedLawyer.name}</p>
            <p className="text-muted-foreground text-sm">{trialData.assignedLawyer.email}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <Separator />

      <div className="text-muted-foreground grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <span className="font-medium">تاريخ الإنشاء: </span>
          <span>{format(new Date(trialData.createdAt), 'dd/MM/yyyy', { locale: ar })}</span>
        </div>
        <div>
          <span className="font-medium">آخر تحديث: </span>
          <span>{format(new Date(trialData.updatedAt), 'dd/MM/yyyy', { locale: ar })}</span>
        </div>
      </div>
    </div>
  )
}
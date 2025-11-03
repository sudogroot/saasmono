'use client'

import { useQuery } from '@tanstack/react-query'
import { Button, CopyButton, Separator, Text, ValueText } from '@repo/ui'
import { orpc } from '@/utils/orpc'
import { globalSheet } from '@/stores/global-sheet-store'
import { Calendar, Clock, Loader2, AlertCircle, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

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
      size: 'md',
    })
  }

  const handleViewClient = () => {
    globalSheet.openClientDetails({
      slug: 'clients',
      clientId: trialData.client.id,
      size: 'md',
      reset: false,
    })
  }

  const trialDate = new Date(trialData.trialDateTime)

  return (
    <div className="space-y-6 p-2">
      <div className="space-y-3">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="ml-1 h-4 w-4" />
            تعديل
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              رقم الجلسة
            </Text>
            <div className="flex-1">
              <ValueText value={`#${trialData.trialNumber}`} size="sm" className="font-mono" />
            </div>
            <CopyButton
              content={trialData.trialNumber.toString()}
              variant={'outline'}
              size="md"
              onCopy={() => {
                toast.success('تم نسخ رقم الجلسة')
              }}
            />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              التاريخ
            </Text>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Text size="sm">{format(trialDate, 'EEEE، dd MMMM yyyy', { locale: ar })}</Text>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              الوقت
            </Text>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Text size="sm">{format(trialDate, 'hh:mm a', { locale: ar })}</Text>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              رقم القضية
            </Text>
            <div className="flex-1">
              <ValueText value={trialData.case.caseNumber} size="sm" className="font-mono" />
            </div>
            <CopyButton
              content={trialData.case.caseNumber}
              variant={'outline'}
              size="md"
              onCopy={() => {
                toast.success('تم نسخ رقم القضية')
              }}
            />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              عنوان القضية
            </Text>
            <ValueText value={trialData.case.caseTitle} size="sm" />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              المحكمة
            </Text>
            <ValueText value={trialData.court.name} size="sm" />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              الولاية
            </Text>
            <ValueText value={trialData.court.state} size="sm" />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              نوع المحكمة
            </Text>
            <ValueText value={trialData.court.courtType} size="sm" />
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted" size="sm">
              المنوب
            </Text>
            <ValueText value={trialData.client.name} size="sm" />
          </div>
          {trialData.client.phone && (
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <Text variant="muted" size="sm">
                هاتف المنوب
              </Text>
              <div className="flex-1">
                <ValueText value={trialData.client.phone} size="sm" className="font-mono" />
              </div>
              <CopyButton
                content={trialData.client.phone}
                variant={'outline'}
                size="md"
                onCopy={() => {
                  toast.success('تم نسخ رقم الهاتف')
                }}
              />
            </div>
          )}
          {trialData.assignedLawyer && (
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <Text variant="muted" size="sm">
                المحامي المكلف
              </Text>
              <ValueText value={trialData.assignedLawyer.name} size="sm" />
            </div>
          )}
        </div>
      </div>
      <Separator className="my-2" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">تاريخ الإضافة</p>
            <Text size="sm">
              {new Date(trialData.createdAt).toLocaleDateString('ar-TN', {
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
              {new Date(trialData.updatedAt).toLocaleDateString('ar-TN', {
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
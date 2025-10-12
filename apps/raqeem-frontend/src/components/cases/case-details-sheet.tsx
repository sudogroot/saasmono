'use client'

import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import {
  Badge,
  Button,
  CopyButton,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ValueText,
} from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Calendar, Clock, Edit, FileText, Gavel, Loader2, Plus, Scale, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EntityBadge } from '../base/entity-badge'

interface CaseDetailsSheetProps {
  caseId: string
  organizationId?: string
  renderMode?: 'content' | 'full'
}

export function CaseDetails({ caseId, organizationId, renderMode = 'content' }: CaseDetailsSheetProps) {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab') || 'info'
  const [activeTab, setActiveTab] = useState(urlTab)

  // Update active tab when URL param changes
  useEffect(() => {
    setActiveTab(urlTab)
  }, [urlTab])

  const {
    data: caseData,
    isLoading,
    error,
  } = useQuery({
    ...orpc.cases.getCaseById.queryOptions({
      input: {
        caseId: caseId,
      },
    }),
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update URL params
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    window.history.replaceState({}, '', url.toString())

    // Update global sheet store so child sheets preserve this tab
    const currentSheet = globalSheet.getNavigationInfo().currentSheet
    if (currentSheet) {
      currentSheet.urlParams = { ...currentSheet.urlParams, tab: value }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="ml-2 h-6 w-6 animate-spin" />
        <span>جاري تحميل بيانات القضية...</span>
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

  if (!caseData) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-8">
        <span>لم يتم العثور على القضية</span>
      </div>
    )
  }

  const handleEdit = () => {
    globalSheet.openCaseForm({
      mode: 'edit',
      slug: 'cases',
      caseId: caseData.id,
      size: 'lg',
    })
  }

  const handleAddTrial = () => {
    globalSheet.openTrialForm({
      mode: 'create',
      slug: 'trials',
      caseId: caseData.id,
      presetData: {
        caseId: caseData.id,
        ...(caseData.court && { courtId: caseData.court.id }),
      },
      size: 'md',
      onSuccess: () => {
        // Return to case details with trials tab active
        globalSheet.back()
      },
    })
  }

  return (
    <div className="space-y-6 p-2">
      <Tabs dir="rtl" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-2">
          <TabsTrigger value={'info'} className="text-muted-foreground text-sm font-medium">
            معلومات القضية
          </TabsTrigger>
          <TabsTrigger value={'trials'} className="text-muted-foreground text-sm font-medium">
            الجلسات
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <div className="space-y-3">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="ml-1 h-4 w-4" />
                تعديل
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <Text size="sm" variant="muted" as="span">
                    القضية
                  </Text>
                </div>
                <div dir="rtl" className="flex-1">
                  <Text size="sm" weight="semibold" as="span">
                    {caseData.caseTitle}
                  </Text>
                </div>

                <CopyButton
                  content={caseData.caseTitle}
                  variant={'outline'}
                  size="md"
                  onCopy={() => {
                    toast.success('تم نسخ العنوان')
                  }}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="flex gap-4">
                  <div>
                    <EntityBadge type="caseStatus" value={caseData.caseStatus} />
                  </div>
                  <div>
                    <EntityBadge type="priority" value={caseData.priority} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">رقم القضية</span>
                </div>
                <ValueText value={caseData.caseNumber} size="sm" className="font-mono" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">موضوع القضية</span>
                </div>
                <ValueText value={caseData.caseSubject} size="sm" className="font-medium" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Gavel className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">رقم الملف بالمحكمة</span>
                </div>
                <ValueText value={caseData.courtFileNumber} size="sm" className="font-mono" fallbackText="غير محدد" />
              </div>
              {caseData.client && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">العميل</span>
                  </div>
                  <div className="text-right">
                    <Text size="sm" weight="semibold" as="span">
                      {caseData.client.name}
                    </Text>
                    <p className="text-muted-foreground text-xs">{caseData.client.clientType}</p>
                    {caseData.client.email && <p className="text-muted-foreground text-xs">{caseData.client.email}</p>}
                  </div>
                </div>
              )}
              {caseData.opponent && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">الخصم</span>
                  </div>
                  <div className="text-right">
                    <Text size="sm" weight="semibold" as="span">
                      {caseData.opponent.name}
                    </Text>
                    <p className="text-muted-foreground text-xs">{caseData.opponent.opponentType}</p>
                  </div>
                </div>
              )}
              {caseData.court && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Gavel className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">المحكمة</span>
                  </div>
                  <div className="text-right">
                    <Text size="sm" weight="semibold" as="span">
                      {caseData.court.name}
                    </Text>
                    <p className="text-muted-foreground text-xs">
                      {caseData.court.state} • {caseData.court.courtType}
                    </p>
                  </div>
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
                  {new Date(caseData.createdAt).toLocaleDateString('ar-TN', {
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
                  {new Date(caseData.updatedAt).toLocaleDateString('ar-TN', {
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
        </TabsContent>
        <TabsContent value="trials">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={handleAddTrial}>
                <Plus className="ml-1 h-4 w-4" />
                إضافة جلسة
              </Button>
            </div>

            {caseData.trial && caseData.trial.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Gavel className="h-4 w-4" />
                    الجلسات ({caseData.trial.length})
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddTrial}>
                    <Plus className="ml-1 h-3 w-3" />
                    إضافة جلسة جديدة
                  </Button>
                </div>
                <div className="space-y-2">
                  {caseData.trial.map((trial) => (
                    <div key={trial.id} className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                          <Scale className="text-primary h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">الجلسة رقم {trial.trialNumber}</div>
                          {trial.court && <div className="text-muted-foreground text-xs">{trial.court.name}</div>}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(trial.trialDateTime).toLocaleDateString('ar-TN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {new Date(trial.trialDateTime).toLocaleTimeString('ar-TN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground space-y-3 py-8 text-center">
                <Gavel className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="mb-1 text-lg font-medium">لا توجد جلسات</p>
                <p className="text-sm">لم يتم جدولة أي جلسات لهذه القضية بعد</p>
                <Button variant="outline" size="sm" onClick={handleAddTrial}>
                  <Plus className="ml-1 h-4 w-4" />
                  إضافة جلسة
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

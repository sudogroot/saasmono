'use client'

import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator, Tabs, TabsContent, TabsList, TabsTrigger, Text, ValueText } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Calendar, Clock, Edit, FileText, Gavel, Loader2, Mail, Phone, Plus, Scale, User } from 'lucide-react'

interface CaseDetailsSheetProps {
  caseId: string
  organizationId?: string
  renderMode?: 'content' | 'full'
}

const caseStatusColors = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  'under-review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'filed-to-court': 'bg-purple-50 text-purple-700 border-purple-200',
  'under-consideration': 'bg-orange-50 text-orange-700 border-orange-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  postponed: 'bg-gray-50 text-gray-700 border-gray-200',
  closed: 'bg-slate-50 text-slate-700 border-slate-200',
  withdrawn: 'bg-pink-50 text-pink-700 border-pink-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
} as const;

const caseStatusLabels = {
  new: 'جديدة',
  'under-review': 'قيد المراجعة',
  'filed-to-court': 'مرفوعة للمحكمة',
  'under-consideration': 'قيد النظر',
  won: 'كسبت',
  lost: 'خسرت',
  postponed: 'مؤجلة',
  closed: 'مغلقة',
  withdrawn: 'منسحبة',
  suspended: 'معلقة',
} as const;

const priorityColors = {
  low: 'bg-gray-50 text-gray-700 border-gray-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
  critical: 'bg-purple-50 text-purple-700 border-purple-200',
} as const;

const priorityLabels = {
  low: 'منخفضة',
  normal: 'عادية',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
  critical: 'حرجة',
} as const;

export function CaseDetails({ caseId, organizationId, renderMode = 'content' }: CaseDetailsSheetProps) {
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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin ml-2' />
        <span>جاري تحميل بيانات القضية...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8 text-destructive'>
        <AlertCircle className='h-5 w-5 ml-2' />
        <span>حدث خطأ في تحميل البيانات</span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className='flex items-center justify-center py-8 text-muted-foreground'>
        <span>لم يتم العثور على القضية</span>
      </div>
    );
  }

  const handleEdit = () => {
    globalSheet.openCaseForm({
      mode: 'edit',
      slug: 'cases',
      caseId: caseData.id,
      initialData: caseData,
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
    })
  }

  return (
    <div className="space-y-6 p-2">
      <Tabs dir="rtl" defaultValue="info">
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
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">عنوان القضية</span>
                </div>
                <div className="flex gap-4">
                  <Badge
                    variant="outline"
                    className={cn('w-fit', caseStatusColors[caseData.caseStatus as keyof typeof caseStatusColors])}
                  >
                    {caseStatusLabels[caseData.caseStatus as keyof typeof caseStatusLabels]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('w-fit', priorityColors[caseData.priority as keyof typeof priorityColors])}
                  >
                    {priorityLabels[caseData.priority as keyof typeof priorityLabels]}
                  </Badge>
                  <div>
                    <Text size="sm" weight="semibold" as="span">
                      {caseData.caseTitle}
                    </Text>
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
                    <p className="text-xs text-muted-foreground">{caseData.client.clientType}</p>
                    {caseData.client.email && (
                      <p className="text-xs text-muted-foreground">{caseData.client.email}</p>
                    )}
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
                    <p className="text-xs text-muted-foreground">{caseData.opponent.opponentType}</p>
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
                    <p className="text-xs text-muted-foreground">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTrial}
                  >
                    <Plus className="ml-1 h-3 w-3" />
                    إضافة جلسة جديدة
                  </Button>
                </div>
                <div className="space-y-2">
                  {caseData.trial.map((trial) => (
                    <div
                      key={trial.id}
                      className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Scale className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            الجلسة رقم {trial.trialNumber}
                          </div>
                          {trial.court && (
                            <div className="text-xs text-muted-foreground">
                              {trial.court.name}
                            </div>
                          )}
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
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
              <div className="text-center py-8 text-muted-foreground space-y-3">
                <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">لا توجد جلسات</p>
                <p className="text-sm">لم يتم جدولة أي جلسات لهذه القضية بعد</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTrial}
                >
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
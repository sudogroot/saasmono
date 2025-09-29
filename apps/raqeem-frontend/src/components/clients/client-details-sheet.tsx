'use client'

import { cn } from '@/lib/utils'
import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator, Tabs, TabsContent, TabsList, TabsTrigger, Text, ValueText } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Calendar, Clock, Edit, FileText, Gavel, Loader2, Mail, Phone, Plus, Scale, User } from 'lucide-react'

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

const caseStatusColors = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  'under-review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'filed-to-court': 'bg-purple-50 text-purple-700 border-purple-200',
  'under-consideration': 'bg-orange-50 text-orange-700 border-orange-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  postponed: 'bg-gray-50 text-gray-700 border-gray-200',
  closed: 'bg-slate-50 text-slate-700 border-slate-200',
  withdrawn: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
} as const

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
} as const

const priorityColors = {
  low: 'bg-gray-50 text-gray-700 border-gray-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
  critical: 'bg-red-100 text-red-800 border-red-300',
} as const

const priorityLabels = {
  low: 'منخفضة',
  normal: 'عادية',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
  critical: 'حرجة',
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
      presetData: {
        clientId: clientData.id,
      },
      size: 'md',
    })
  }

  return (
    <div className="space-y-6 p-2">
      <Tabs dir="rtl" defaultValue="info">
        <TabsList className="mb-2">
          <TabsTrigger value={'info'} className="text-muted-foreground text-sm font-medium">
            المعلومات الشخصية
          </TabsTrigger>
          <TabsTrigger value={'cases'} className="text-muted-foreground text-sm font-medium">
            القضايا
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
                    <Text size="sm" weight="semibold" as="span">
                      {clientData.name}
                    </Text>
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
          <Separator className="my-2" />
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
        </TabsContent>
        <TabsContent value="cases">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={handleAddCase}>
                <Plus className="ml-1 h-4 w-4" />
                إضافة قضية
              </Button>
            </div>

            {clientData.case && clientData.case.length > 0 ? (
              <div className="space-y-4">
                {clientData.case.map((caseItem) => (
                  <Card key={caseItem.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            {caseItem.caseTitle}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>رقم القضية: {caseItem.caseNumber}</span>
                            {caseItem.courtFileNumber && (
                              <>
                                <span>•</span>
                                <span>رقم الملف: {caseItem.courtFileNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', caseStatusColors[caseItem.caseStatus as keyof typeof caseStatusColors])}
                          >
                            {caseStatusLabels[caseItem.caseStatus as keyof typeof caseStatusLabels] || caseItem.caseStatus}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', priorityColors[caseItem.priority as keyof typeof priorityColors])}
                          >
                            {priorityLabels[caseItem.priority as keyof typeof priorityLabels] || caseItem.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <p>{caseItem.caseSubject}</p>
                        </div>

                        {caseItem.trial && caseItem.trial.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Gavel className="h-4 w-4" />
                                الجلسات ({caseItem.trial.length})
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => globalSheet.openTrialForm({
                                  mode: 'create',
                                  slug: 'trials',
                                  caseId: caseItem.id,
                                  presetData: {
                                    caseId: caseItem.id,
                                  },
                                  size: 'md',
                                })}
                              >
                                <Plus className="ml-1 h-3 w-3" />
                                إضافة جلسة جديدة
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {caseItem.trial.map((trial) => (
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
                        )}

                        {(!caseItem.trial || caseItem.trial.length === 0) && (
                          <div className="text-center py-4 text-muted-foreground space-y-3">
                            <Gavel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">لا توجد جلسات مجدولة لهذه القضية</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => globalSheet.openTrialForm({
                                mode: 'create',
                                slug: 'trials',
                                caseId: caseItem.id,
                                presetData: {
                                  caseId: caseItem.id,
                                },
                                size: 'md',
                              })}
                            >
                              <Plus className="ml-1 h-4 w-4" />
                              إضافة جلسة
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">لا توجد قضايا</p>
                <p className="text-sm">لم يتم إنشاء أي قضايا لهذا العميل بعد</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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

      </div>*/}
    </div>
  )
}

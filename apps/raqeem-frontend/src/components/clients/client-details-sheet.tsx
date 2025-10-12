'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { AlertCircle, Calendar, Clock, Edit, FileText, Gavel, Loader2, Plus, Scale } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EntityBadge } from '../base/entity-badge'

interface ClientDetailsSheetProps {
  clientId: string
  organizationId?: string
  renderMode?: 'content' | 'full'
}

export function ClientDetails({ clientId, organizationId, renderMode = 'content' }: ClientDetailsSheetProps) {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab') || 'info'
  const [activeTab, setActiveTab] = useState(urlTab)

  // Update active tab when URL param changes
  useEffect(() => {
    setActiveTab(urlTab)
  }, [urlTab])

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
      onSuccess: () => {
        // Return to client details with cases tab active
        globalSheet.back()
      },
    })
  }

  return (
    <div className="space-y-6 p-2">
      <Tabs dir="rtl" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-2">
          <TabsTrigger value={'info'}>المعلومات الشخصية</TabsTrigger>
          <TabsTrigger value={'cases'}>القضايا</TabsTrigger>
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
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <Text variant="muted" size="sm">
                  الاسم
                </Text>
                <div className="flex-1 text-right">
                  <Text size="sm" weight="semibold" as="span">
                    {clientData.name}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <Text variant="muted" size="sm">
                  الصفة
                </Text>
                <EntityBadge type="entityType" value={clientData.clientType} />
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <Text variant="muted" size="sm">
                  البريد الإلكتروني
                </Text>
                <div className="flex-1">
                  <ValueText value={clientData.email} size="sm" fallbackText="غير محدد" />
                </div>
                {clientData.email && (
                  <CopyButton
                    content={clientData.email}
                    variant={'outline'}
                    size="md"
                    onCopy={() => {
                      toast.success('تم نسخ البريد الإلكتروني')
                    }}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <Text variant="muted" size="sm">
                  رقم الهاتف
                </Text>
                <div className="flex-1">
                  <ValueText value={clientData.phone} size="sm" fallbackText="غير محدد" />
                </div>
                {clientData.phone && (
                  <CopyButton
                    content={clientData.phone}
                    variant={'outline'}
                    size="md"
                    onCopy={() => {
                      toast.success('تم نسخ رقم الهاتف')
                    }}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <Text variant="muted" size="sm">
                  رقم الهوية
                </Text>
                <div className="flex-1">
                  <ValueText value={clientData.nationalId} size="sm" className="font-mono" fallbackText="غير محدد" />
                </div>
                {clientData.nationalId && (
                  <CopyButton
                    content={clientData.nationalId}
                    variant={'outline'}
                    size="md"
                    onCopy={() => {
                      toast.success('تم نسخ رقم الهوية')
                    }}
                  />
                )}
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
                  <Card
                    key={caseItem.id}
                    className="hover:bg-muted/50 cursor-pointer overflow-hidden transition-colors"
                    onClick={() => {
                      globalSheet.openCaseDetails({
                        slug: 'cases',
                        caseId: caseItem.id,
                        size: 'md',
                      })
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            {caseItem.caseTitle}
                          </CardTitle>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
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
                          <EntityBadge type="caseStatus" value={caseItem.caseStatus} className="text-xs" />
                          <EntityBadge type="priority" value={caseItem.priority} className="text-xs" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-muted-foreground text-sm">
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  globalSheet.openTrialForm({
                                    mode: 'create',
                                    slug: 'trials',
                                    caseId: caseItem.id,
                                    presetData: {
                                      caseId: caseItem.id,
                                    },
                                    size: 'md',
                                  })
                                }}
                              >
                                <Plus className="ml-1 h-3 w-3" />
                                إضافة جلسة جديدة
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {caseItem.trial.map((trial) => (
                                <div
                                  key={trial.id}
                                  className="bg-muted/30 flex items-center justify-between rounded-lg border p-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                      <Scale className="text-primary h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium">الجلسة رقم {trial.trialNumber}</div>
                                      {trial.court && (
                                        <div className="text-muted-foreground text-xs">{trial.court.name}</div>
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
                        )}

                        {(!caseItem.trial || caseItem.trial.length === 0) && (
                          <div className="text-muted-foreground space-y-3 py-4 text-center">
                            <Gavel className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p className="text-sm">لا توجد جلسات مجدولة لهذه القضية</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                globalSheet.openTrialForm({
                                  mode: 'create',
                                  slug: 'trials',
                                  caseId: caseItem.id,
                                  presetData: {
                                    caseId: caseItem.id,
                                  },
                                  size: 'md',
                                })
                              }}
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
              <div className="text-muted-foreground py-8 text-center">
                <FileText className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="mb-1 text-lg font-medium">لا توجد قضايا</p>
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

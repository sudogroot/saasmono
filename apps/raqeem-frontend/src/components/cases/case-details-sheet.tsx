'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CaseAvatar } from './case-avatar';
import { orpc } from '@/utils/orpc';
import { TrialsList } from '../trials/trials-list';
import { globalSheet } from '@/stores/global-sheet-store';
import { FileText, Users, Gavel, Calendar, Loader2, AlertCircle, Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseDetailsSheetProps {
  caseId: string;
  organizationId?: string;
  renderMode?: 'content' | 'full';
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

export function CaseDetails({
  caseId,
  organizationId,
  renderMode = 'content'
}: CaseDetailsSheetProps) {
  const {
    data: caseData,
    isLoading,
    error,
  } = useQuery({
    ...orpc.cases.getByIdWithDetails.queryOptions({
      input: {
        id: caseId,
        includeDeleted: false,
      },
    }),
  });

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
      size: 'lg'
    });
  };

  const handleAddTrial = () => {
    // Note: This would open a trial form - implementation depends on if you have a trial form component
    console.log('Add trial for case:', caseData.id);
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-start gap-4'>
        <CaseAvatar case_={caseData} size='xl' />
        <div className='flex-1 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>{caseData.caseTitle}</h2>
            <p className='text-muted-foreground font-mono'>{caseData.caseNumber}</p>
          </div>
          <div className='flex gap-2'>
            <Badge
              variant='outline'
              className={cn(
                'w-fit',
                caseStatusColors[caseData.caseStatus as keyof typeof caseStatusColors]
              )}
            >
              {caseStatusLabels[caseData.caseStatus as keyof typeof caseStatusLabels]}
            </Badge>
            <Badge
              variant='outline'
              className={cn(
                'w-fit',
                priorityColors[caseData.priority as keyof typeof priorityColors]
              )}
            >
              {priorityLabels[caseData.priority as keyof typeof priorityLabels]}
            </Badge>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleEdit}
          >
            <Edit className='h-4 w-4 ml-1' />
            تعديل
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={handleAddTrial}
          >
            <Plus className='h-4 w-4 ml-1' />
            إضافة جلسة
          </Button>
        </div>
      </div>

      <Separator />

      {/* Case Information */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          معلومات القضية
        </h3>

        <div className='space-y-3'>
          <div className='space-y-1'>
            <label className='text-sm font-medium text-muted-foreground'>موضوع القضية</label>
            <p className='text-foreground'>{caseData.caseSubject}</p>
          </div>

          {caseData.courtFileNumber && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                رقم الملف بالمحكمة
              </label>
              <p className='text-foreground font-mono'>{caseData.courtFileNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Parties Information */}
      <Separator />
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <Users className='h-5 w-5' />
          الأطراف
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {caseData.client && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>العميل</label>
              <p className='text-foreground'>{caseData.client.name}</p>
              <p className='text-xs text-muted-foreground'>{caseData.client.clientType}</p>
            </div>
          )}

          {caseData.opponent && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>الخصم</label>
              <p className='text-foreground'>{caseData.opponent.name}</p>
              <p className='text-xs text-muted-foreground'>{caseData.opponent.opponentType}</p>
            </div>
          )}
        </div>
      </div>

      {/* Court Information */}
      {caseData.court && (
        <>
          <Separator />
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Gavel className='h-5 w-5' />
              معلومات المحكمة
            </h3>

            <div className='space-y-2'>
              <div>
                <p className='text-foreground font-medium'>{caseData.court.name}</p>
                <p className='text-sm text-muted-foreground'>
                  {caseData.court.state} • {caseData.court.courtType}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trials Section */}
      <Separator />
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <Gavel className='h-5 w-5' />
          الجلسات
        </h3>

        <TrialsList caseId={caseData.id} />
      </div>

      {/* Timestamps */}
      <Separator />
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          التواريخ
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-muted-foreground'>تاريخ الإضافة</p>
            <p className='text-foreground'>
              {new Date(caseData.createdAt).toLocaleDateString('ar-TN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div>
            <p className='text-muted-foreground'>آخر تحديث</p>
            <p className='text-foreground'>
              {new Date(caseData.updatedAt).toLocaleDateString('ar-TN', {
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
    </div>
  );
}
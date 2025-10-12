'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { orpc } from '@/utils/orpc'
import { Button, Separator, Text } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Edit, Loader2 } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'

interface OpponentDetailsSheetProps {
  opponentId: string
  organizationId?: string
  renderMode?: 'content' | 'full'
}

export function OpponentDetails({ opponentId, organizationId, renderMode = 'content' }: OpponentDetailsSheetProps) {
  const {
    data: opponentData,
    isLoading,
    error,
  } = useQuery({
    ...orpc.opponents.getOpponentById.queryOptions({
      input: {
        opponentId: opponentId,
      },
    }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="ml-2 h-6 w-6 animate-spin" />
        <span>جاري تحميل بيانات الخصم...</span>
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

  if (!opponentData) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-8">
        <span>لم يتم العثور على الخصم</span>
      </div>
    )
  }

  const handleEdit = () => {
    globalSheet.openOpponentForm({
      mode: 'edit',
      slug: 'opponents',
      opponentId: opponentData.id,
      size: 'md',
    })
  }

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
            <Text variant="muted">الاسم</Text>
            <div className="flex-1 text-right">
              <Text weight="semibold" as="span">
                {opponentData.name}
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <Text variant="muted">الصفة</Text>
            <EntityBadge type="entityType" value={opponentData.opponentType} />
          </div>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">تاريخ الإضافة</p>
            <Text>
              {new Date(opponentData.createdAt).toLocaleDateString('ar-TN', {
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
            <Text>
              {new Date(opponentData.updatedAt).toLocaleDateString('ar-TN', {
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

'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { Button, Card, Text } from '@repo/ui'
import { User, ChevronLeft, FileText } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'
import { cn } from '@repo/ui/lib/utils'

interface Case {
  id: string
  caseNumber: string
  caseTitle: string
  caseSubject: string | null
  caseStatus: string
  priority: string
  clientName: string
  createdAt: Date
}

interface LatestCasesEnhancedProps {
  cases: Case[]
  onViewAll?: () => void
}

export function LatestCasesEnhanced({ cases, onViewAll }: LatestCasesEnhancedProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - new Date(date).getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'اليوم'
    if (diffInDays === 1) return 'أمس'
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`
    return `منذ ${Math.floor(diffInDays / 30)} شهر`
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold sm:text-lg">أحدث القضايا</h3>
            {cases.length > 0 && (
              <span className="bg-green-600/10 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5 text-xs font-medium">
                {cases.length}
              </span>
            )}
          </div>
          {cases.length > 0 && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 gap-1 text-xs">
              عرض الكل
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3">
        {cases.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center">
            <FileText className="text-muted-foreground/50 mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12" />
            <Text size="sm" className="text-xs sm:text-sm">لا توجد قضايا بعد</Text>
          </div>
        ) : (
          <div className="space-y-2">
            {cases.map((caseItem) => (
              <button
                key={caseItem.id}
                className={cn(
                  'group w-full rounded-lg border border-l-4 border-l-green-500 bg-card p-3 text-right transition-all',
                  'hover:border-primary/50 hover:shadow-md hover:scale-[1.01]',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'active:scale-[0.99]'
                )}
                onClick={() => {
                  globalSheet.openCaseDetails({
                    slug: 'cases',
                    caseId: caseItem.id,
                    size: 'md',
                  })
                }}
              >
                <div className="space-y-2.5">
                  {/* Title and time */}
                  <div className="flex items-start justify-between gap-2">
                    <Text weight="semibold" className="line-clamp-2 flex-1 text-sm leading-snug sm:text-base">
                      {caseItem.caseTitle}
                    </Text>
                    <span className="bg-muted text-muted-foreground mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium">
                      {getTimeAgo(caseItem.createdAt)}
                    </span>
                  </div>

                  {/* Case info */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Text size="xs" variant="muted" className="font-mono text-[10px] sm:text-xs">
                      {caseItem.caseNumber}
                    </Text>
                    <EntityBadge type="caseStatus" value={caseItem.caseStatus} className="text-[10px] sm:text-xs" showIcon={false} />
                    <EntityBadge type="priority" value={caseItem.priority} className="text-[10px] sm:text-xs" showIcon={false} />
                  </div>

                  {/* Client info */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                    <User className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                    <span className="truncate">{caseItem.clientName}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

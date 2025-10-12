'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { Text } from '@repo/ui'
import { User } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'

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

interface LatestCasesProps {
  cases: Case[]
}

export function LatestCases({ cases }: LatestCasesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">أحدث القضايا</h3>
        {cases.length > 0 && <Text variant="muted" size="sm">{cases.length}</Text>}
      </div>

      {cases.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center">
          <Text size="sm">لا توجد قضايا بعد</Text>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              onClick={() => {
                globalSheet.openCaseDetails({
                  slug: 'cases',
                  caseId: caseItem.id,
                  size: 'md',
                })
              }}
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <Text weight="medium" className="line-clamp-1 text-sm">
                    {caseItem.caseTitle}
                  </Text>
                  <div className="flex flex-wrap items-center gap-2">
                    <Text size="xs" variant="muted" className="font-mono">
                      {caseItem.caseNumber}
                    </Text>
                    <EntityBadge type="caseStatus" value={caseItem.caseStatus} className="text-xs" />
                    <EntityBadge type="priority" value={caseItem.priority} className="text-xs" />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{caseItem.clientName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

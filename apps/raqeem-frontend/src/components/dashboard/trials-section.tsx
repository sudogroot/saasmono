'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { Button, Text } from '@repo/ui'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'

interface Trial {
  id: string
  trialNumber: number
  trialDateTime: Date
  court: {
    id: string
    name: string
  }
  case: {
    id: string
    caseNumber: string
    caseTitle: string
    caseStatus: string
    priority: string
  }
}

interface TrialsSectionProps {
  title: string
  trials: Trial[]
  emptyMessage: string
}

export function TrialsSection({ title, trials, emptyMessage }: TrialsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {trials.length > 0 && <Text variant="muted" size="sm">{trials.length}</Text>}
      </div>

      {trials.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center">
          <Text size="sm">{emptyMessage}</Text>
        </div>
      ) : (
        <div className="space-y-2">
          {trials.map((trial, index) => (
            <div
              key={trial.id}
              className="group flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              onClick={() => {
                globalSheet.openCaseDetails({
                  slug: 'cases',
                  caseId: trial.case.id,
                  size: 'md',
                })
              }}
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <Text weight="medium" className="line-clamp-1 text-sm">
                    {trial.case.caseTitle}
                  </Text>
                  <div className="flex flex-wrap items-center gap-2">
                    <Text size="xs" variant="muted" className="font-mono">
                      {trial.case.caseNumber}
                    </Text>
                    <EntityBadge type="caseStatus" value={trial.case.caseStatus} className="text-xs" />
                    <EntityBadge type="priority" value={trial.case.priority} className="text-xs" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{trial.court.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(trial.trialDateTime).toLocaleDateString('ar-TN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(trial.trialDateTime).toLocaleTimeString('ar-TN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

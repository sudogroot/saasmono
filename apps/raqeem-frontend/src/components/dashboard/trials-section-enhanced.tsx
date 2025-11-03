'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { Button, Card, Text } from '@repo/ui'
import { Calendar, Clock, MapPin, ChevronLeft } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'
import { cn } from '@repo/ui/lib/utils'

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

interface TrialsSectionEnhancedProps {
  title: string
  trials: Trial[]
  emptyMessage: string
  variant?: 'today' | 'tomorrow' | 'past'
  onViewAll?: () => void
}

export function TrialsSectionEnhanced({ title, trials, emptyMessage, variant = 'today', onViewAll }: TrialsSectionEnhancedProps) {
  const variantStyles = {
    today: 'border-l-4 border-l-blue-500',
    tomorrow: 'border-l-4 border-l-amber-500',
    past: 'border-l-4 border-l-gray-400',
  }

  const variantColors = {
    today: 'bg-blue-50 dark:bg-blue-950',
    tomorrow: 'bg-amber-50 dark:bg-amber-950',
    past: 'bg-gray-50 dark:bg-gray-900',
  }

  return (
    <Card className="overflow-hidden">
      <div className={cn('p-4 pb-3', variantColors[variant])}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold sm:text-lg">{title}</h3>
            {trials.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                {trials.length}
              </span>
            )}
          </div>
          {trials.length > 0 && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 gap-1 text-xs">
              عرض الكل
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3">
        {trials.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center">
            <Calendar className="text-muted-foreground/50 mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12" />
            <Text size="sm" className="text-xs sm:text-sm">{emptyMessage}</Text>
          </div>
        ) : (
          <div className="space-y-2">
            {trials.map((trial) => (
              <button
                key={trial.id}
                className={cn(
                  'group w-full rounded-lg border bg-card p-3 text-right transition-all',
                  'hover:border-primary/50 hover:shadow-md hover:scale-[1.01]',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'active:scale-[0.99]',
                  variantStyles[variant]
                )}
                onClick={() => {
                  globalSheet.openCaseDetails({
                    slug: 'cases',
                    caseId: trial.case.id,
                    size: 'md',
                  })
                }}
              >
                <div className="space-y-2.5">
                  {/* Title and badges */}
                  <div className="space-y-1.5">
                    <Text weight="semibold" className="line-clamp-2 text-sm leading-snug sm:text-base">
                      {trial.case.caseTitle}
                    </Text>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Text size="xs" variant="muted" className="font-mono text-[10px] sm:text-xs">
                        {trial.case.caseNumber}
                      </Text>
                      <EntityBadge type="caseStatus" value={trial.case.caseStatus} className="text-[10px] sm:text-xs" showIcon={false} />
                      <EntityBadge type="priority" value={trial.case.priority} className="text-[10px] sm:text-xs" showIcon={false} />
                    </div>
                  </div>

                  {/* Trial info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                      <span className="truncate">{trial.court.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                      <span className="whitespace-nowrap">
                        {new Date(trial.trialDateTime).toLocaleDateString('ar-TN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                      <span className="whitespace-nowrap font-mono">
                        {new Date(trial.trialDateTime).toLocaleTimeString('ar-TN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
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

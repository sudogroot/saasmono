'use client'

import { FileCheck } from 'lucide-react'

interface SummarySectionProps {
  summary: string | null
}

export function SummarySection({ summary }: SummarySectionProps) {
  if (!summary || summary.trim().length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
          <FileCheck className="h-4 w-4" />
          <span>الملخص</span>
        </div>
        <div className="text-muted-foreground text-sm text-center py-8">
          لا يوجد ملخص
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
        <FileCheck className="h-4 w-4" />
        <span>الملخص</span>
      </div>
      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {summary}
      </div>
    </div>
  )
}

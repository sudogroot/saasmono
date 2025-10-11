'use client'

import { Tag } from 'lucide-react'

interface KeywordsSectionProps {
  keywords: string | null
}

export function KeywordsSection({ keywords }: KeywordsSectionProps) {
  const keywordsArray = keywords?.split(',').filter((k) => k.trim().length > 0) || []

  if (keywordsArray.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
          <Tag className="h-4 w-4" />
          <span>الكلمات المفتاحية</span>
        </div>
        <div className="text-muted-foreground text-sm text-center py-8">
          لا توجد كلمات مفتاحية
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
        <Tag className="h-4 w-4" />
        <span>الكلمات المفتاحية</span>
      </div>
      <ul className="space-y-2">
        {keywordsArray.map((keyword, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <span className="text-foreground">{keyword.trim()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

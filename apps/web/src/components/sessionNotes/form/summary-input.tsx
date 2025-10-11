'use client'

import { Textarea } from '@repo/ui'

interface SummaryInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function SummaryInput({
  value,
  onChange,
  placeholder = 'اكتب ملخصاً للملاحظات...',
  disabled = false,
}: SummaryInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={4}
      className="resize-none"
    />
  )
}

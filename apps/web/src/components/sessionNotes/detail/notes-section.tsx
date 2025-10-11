'use client'

import { QuillEditor } from '../quill-editor'
import { FileText } from 'lucide-react'

interface NotesSectionProps {
  notes: string | null
}

export function NotesSection({ notes }: NotesSectionProps) {
  if (!notes || notes.trim().length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
          <FileText className="h-4 w-4" />
          <span>الملاحظات الرئيسية</span>
        </div>
        <div className="text-muted-foreground text-sm text-center py-8">
          لا توجد ملاحظات
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
        <FileText className="h-4 w-4" />
        <span>الملاحظات الرئيسية</span>
      </div>
      <div className="prose prose-sm max-w-none">
        <QuillEditor value={notes} readonly={true} />
      </div>
    </div>
  )
}

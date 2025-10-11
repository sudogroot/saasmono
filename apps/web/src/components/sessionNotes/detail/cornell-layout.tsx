'use client'

import { KeywordsSection } from './keywords-section'
import { NotesSection } from './notes-section'
import { SummarySection } from './summary-section'
import { AttachmentsSection } from './attachments-section'

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: string | null
  mimeType: string | null
  description: string | null
}

interface CornellLayoutProps {
  keywords: string | null
  notes: string | null
  summary: string | null
  attachments: Attachment[]
}

export function CornellLayout({ keywords, notes, summary, attachments }: CornellLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Cornell Notes Layout: Keywords sidebar + Notes main area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Keywords Section (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-6">
            <KeywordsSection keywords={keywords} />
          </div>
        </div>

        {/* Notes Section (Main Area) */}
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-lg p-6">
            <NotesSection notes={notes} />
          </div>
        </div>
      </div>

      {/* Summary Section (Full Width) */}
      <div className="bg-white border rounded-lg p-6">
        <SummarySection summary={summary} />
      </div>

      {/* Attachments Section (Full Width) */}
      <div className="bg-white border rounded-lg p-6">
        <AttachmentsSection attachments={attachments} />
      </div>
    </div>
  )
}

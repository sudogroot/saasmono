'use client'

import { Button } from '@repo/ui'
import { Paperclip, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react'

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: string | null
  mimeType: string | null
  description: string | null
}

interface AttachmentsSectionProps {
  attachments: Attachment[]
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <FileText className="h-5 w-5" />

  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5" />
  }

  if (mimeType.includes('pdf')) {
    return <FileText className="h-5 w-5 text-red-500" />
  }

  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  return <FileText className="h-5 w-5" />
}

function formatFileSize(sizeStr: string | null): string {
  if (!sizeStr) return ''

  const size = parseInt(sizeStr)
  if (isNaN(size)) return ''

  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
          <Paperclip className="h-4 w-4" />
          <span>المرفقات</span>
        </div>
        <div className="text-muted-foreground text-sm text-center py-8">
          لا توجد مرفقات
        </div>
      </div>
    )
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Open file in new tab (download handled by browser)
    window.open(fileUrl, '_blank')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
        <Paperclip className="h-4 w-4" />
        <span>المرفقات ({attachments.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded shrink-0">
                {getFileIcon(attachment.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate" title={attachment.fileName}>
                  {attachment.fileName}
                </div>
                {attachment.fileSize && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(attachment.fileSize)}
                  </div>
                )}
              </div>
            </div>

            {attachment.description && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {attachment.description}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
              >
                <Download className="h-3 w-3 ml-1" />
                تحميل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(attachment.fileUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

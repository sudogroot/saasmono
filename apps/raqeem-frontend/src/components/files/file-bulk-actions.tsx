'use client'

import { Button, Card } from '@repo/ui'
import { Archive, CheckSquare, Download, Tag, Trash2, X } from 'lucide-react'
import type { FileDocument } from './types'

interface FileBulkActionsProps {
  selectedFiles: FileDocument[]
  onClearSelection: () => void
  onBulkDownload?: (files: FileDocument[]) => void
  onBulkDelete?: (files: FileDocument[]) => void
  onBulkTag?: (files: FileDocument[]) => void
  onBulkArchive?: (files: FileDocument[]) => void
}

export function FileBulkActions({
  selectedFiles,
  onClearSelection,
  onBulkDownload,
  onBulkDelete,
  onBulkTag,
  onBulkArchive,
}: FileBulkActionsProps) {
  if (selectedFiles.length === 0) return null

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg">
      <div className="flex items-center gap-3 p-3">
        {/* Selection Count */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'ملف محدد' : 'ملفات محددة'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onBulkDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkDownload(selectedFiles)}
            >
              <Download className="h-4 w-4 ml-2" />
              تحميل
            </Button>
          )}

          {onBulkTag && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkTag(selectedFiles)}
            >
              <Tag className="h-4 w-4 ml-2" />
              إضافة وسم
            </Button>
          )}

          {onBulkArchive && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkArchive(selectedFiles)}
            >
              <Archive className="h-4 w-4 ml-2" />
              أرشفة
            </Button>
          )}

          {onBulkDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkDelete(selectedFiles)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </Button>
          )}
        </div>

        {/* Clear Selection */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

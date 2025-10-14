'use client'

import { Badge, Button, Card, Separator } from '@repo/ui'
import {
  Briefcase,
  Calendar,
  Download,
  Edit,
  File,
  FileText,
  Gavel,
  Image as ImageIcon,
  Scale,
  User,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { FileDocument } from './types'
import { formatFileSize, getFileIcon } from './mocks/files-data'

interface FileViewerProps {
  file: FileDocument
  onEdit?: () => void
  onDownload?: () => void
  onClose?: () => void
  className?: string
}

const iconMap: Record<string, any> = {
  FileText,
  Image: ImageIcon,
  File,
}

const entityIconMap = {
  case: Briefcase,
  trial: Gavel,
  client: User,
  opponent: Users,
}

export function FileViewer({ file, onEdit, onDownload, onClose, className }: FileViewerProps) {
  const IconComponent = iconMap[getFileIcon(file.fileType)] || File

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* File Preview */}
      <Card className="overflow-hidden">
        {file.thumbnailUrl ? (
          <div className="relative w-full bg-muted">
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-primary/5">
            <IconComponent className="h-20 w-20 text-primary" />
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {onDownload && (
          <Button onClick={onDownload} className="flex-1 sm:flex-initial">
            <Download className="ml-2 h-4 w-4" />
            تحميل
          </Button>
        )}
        {onEdit && (
          <Button onClick={onEdit} variant="outline" className="flex-1 sm:flex-initial">
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button>
        )}
      </div>

      {/* File Details */}
      <div className="space-y-4">
        {/* File Name and Description */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{file.name}</h2>
          {file.description && (
            <p className="text-sm sm:text-base text-muted-foreground">{file.description}</p>
          )}
        </div>

        <Separator />

        {/* Meta Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">رفع بواسطة</p>
                <p className="text-sm font-medium">{file.uploadedBy.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">تاريخ الرفع</p>
                <p className="text-sm font-medium">
                  {format(new Date(file.uploadedAt), 'dd MMMM yyyy، HH:mm', { locale: ar })}
                </p>
              </div>
            </div>

            {new Date(file.updatedAt).getTime() !== new Date(file.uploadedAt).getTime() && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">آخر تحديث</p>
                  <p className="text-sm font-medium">
                    {format(new Date(file.updatedAt), 'dd MMMM yyyy، HH:mm', { locale: ar })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">نوع الملف</p>
                <p className="text-sm font-medium">{file.mimeType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">حجم الملف</p>
                <p className="text-sm font-medium">{formatFileSize(file.size)}</p>
              </div>
            </div>

            {file.metadata && (
              <>
                {file.metadata.pageCount && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">عدد الصفحات</p>
                      <p className="text-sm font-medium">{file.metadata.pageCount}</p>
                    </div>
                  </div>
                )}
                {file.metadata.width && file.metadata.height && (
                  <div className="flex items-start gap-3">
                    <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">الأبعاد</p>
                      <p className="text-sm font-medium">
                        {file.metadata.width} × {file.metadata.height}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Tags */}
        {file.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">الوسوم</h3>
            <div className="flex flex-wrap gap-2">
              {file.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Linked Entities */}
        {file.linkedEntities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">مرتبط بـ</h3>
            <div className="space-y-2">
              {file.linkedEntities.map((entity) => {
                const EntityIcon = entityIconMap[entity.type]
                return (
                  <Card key={entity.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <EntityIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {entity.type === 'case' && 'قضية'}
                          {entity.type === 'trial' && 'جلسة'}
                          {entity.type === 'client' && 'عميل'}
                          {entity.type === 'opponent' && 'خصم'}
                        </p>
                        <p className="text-sm font-medium truncate">{entity.name}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

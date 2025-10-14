'use client'

import { Badge, Button, Card, Checkbox } from '@repo/ui'
import { Calendar, Download, Edit, Eye, File, FileText, Image, MoreVertical, Trash, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { FileDocument } from './types'
import { formatFileSize, getFileIcon } from './mocks/files-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui'

interface FileCardProps {
  file: FileDocument
  onView?: (file: FileDocument) => void
  onEdit?: (file: FileDocument) => void
  onDownload?: (file: FileDocument) => void
  onDelete?: (file: FileDocument) => void
  variant?: 'grid' | 'list'
  className?: string
  isSelected?: boolean
  onSelect?: (file: FileDocument, selected: boolean) => void
  selectionMode?: boolean
}

const iconMap: Record<string, any> = {
  FileText,
  Image,
  File,
}

export function FileCard({
  file,
  onView,
  onEdit,
  onDownload,
  onDelete,
  variant = 'grid',
  className,
  isSelected = false,
  onSelect,
  selectionMode = false,
}: FileCardProps) {
  const IconComponent = iconMap[getFileIcon(file.fileType)] || File

  const handleAction = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation()
    action()
  }

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(file, !isSelected)
    } else {
      onView?.(file)
    }
  }

  if (variant === 'list') {
    return (
      <Card
        className={`group cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''} ${className || ''}`}
        onClick={handleCardClick}
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Selection Checkbox */}
            {selectionMode && (
              <div className="shrink-0 mt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect?.(file, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* File Icon or Thumbnail */}
            <div className="shrink-0">
              {file.thumbnailUrl ? (
                <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-primary/10">
                  <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold truncate group-hover:text-primary transition-colors">
                    {file.name}
                  </h3>
                  {file.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {file.description}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={(e: any) => handleAction(() => onView(file), e)}>
                        <Eye className="ml-2 h-4 w-4" />
                        عرض
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={(e: any) => handleAction(() => onEdit(file), e)}>
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                    )}
                    {onDownload && (
                      <DropdownMenuItem onClick={(e: any) => handleAction(() => onDownload(file), e)}>
                        <Download className="ml-2 h-4 w-4" />
                        تحميل
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e: any) => handleAction(() => onDelete(file), e)}
                          className="text-destructive"
                        >
                          <Trash className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {file.uploadedBy.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(file.uploadedAt), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
                <span>{formatFileSize(file.size)}</span>
              </div>

              {/* Tags */}
              {file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {file.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-0">
                      {tag.name}
                    </Badge>
                  ))}
                  {file.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{file.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Linked Entities */}
              {file.linkedEntities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {file.linkedEntities.slice(0, 2).map((entity) => (
                    <Badge key={entity.id} variant="outline" className="text-xs px-2 py-0">
                      {entity.name}
                    </Badge>
                  ))}
                  {file.linkedEntities.length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{file.linkedEntities.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid variant
  return (
    <Card
      className={`group cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''} ${className || ''}`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-3 right-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect?.(file, checked as boolean)}
              onClick={(e) => e.stopPropagation()}
              className="bg-background"
            />
          </div>
        )}

        {/* File Preview */}
        <div className="mb-3">
          {file.thumbnailUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-primary/10">
              <IconComponent className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
              {file.name}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={(e: any) => handleAction(() => onView(file), e)}>
                    <Eye className="ml-2 h-4 w-4" />
                    عرض
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={(e: any) => handleAction(() => onEdit(file), e)}>
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                )}
                {onDownload && (
                  <DropdownMenuItem onClick={(e: any) => handleAction(() => onDownload(file), e)}>
                    <Download className="ml-2 h-4 w-4" />
                    تحميل
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e: any) => handleAction(() => onDelete(file), e)}
                      className="text-destructive"
                    >
                      <Trash className="ml-2 h-4 w-4" />
                      حذف
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {file.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{file.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {file.uploadedBy.name}
            </span>
            <span>{formatFileSize(file.size)}</span>
          </div>

          {/* Tags */}
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {file.tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-0">
                  {tag.name}
                </Badge>
              ))}
              {file.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  +{file.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

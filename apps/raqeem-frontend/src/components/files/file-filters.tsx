'use client'

import {
  Badge,
  Button,
  Checkbox,
  Label,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui'
import { Calendar, SlidersHorizontal, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { mockTags } from './mocks/files-data'
import type { FileFilters, FileType } from './types'

interface FileFiltersProps {
  filters: FileFilters
  onFiltersChange: (filters: FileFilters) => void
  onClearFilters: () => void
}

const fileTypes: { value: FileType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'مستندات' },
  { value: 'image', label: 'صور' },
  { value: 'video', label: 'فيديو' },
  { value: 'audio', label: 'صوتيات' },
  { value: 'other', label: 'أخرى' },
]

export function FileFilters({ filters, onFiltersChange, onClearFilters }: FileFiltersProps) {
  const [open, setOpen] = useState(false)
  const [selectedFileTypes, setSelectedFileTypes] = useState<FileType[]>(filters.fileType || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || [])

  const handleApplyFilters = () => {
    onFiltersChange({
      ...filters,
      fileType: selectedFileTypes.length > 0 ? selectedFileTypes : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    })
    setOpen(false)
  }

  const handleClearAll = () => {
    setSelectedFileTypes([])
    setSelectedTags([])
    onClearFilters()
    setOpen(false)
  }

  const handleFileTypeChange = (type: FileType, checked: boolean) => {
    if (checked) {
      setSelectedFileTypes([...selectedFileTypes, type])
    } else {
      setSelectedFileTypes(selectedFileTypes.filter((t) => t !== type))
    }
  }

  const handleTagChange = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tagId])
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tagId))
    }
  }

  const activeFiltersCount =
    (filters.fileType?.length || 0) + (filters.tags?.length || 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 px-3 relative">
          <SlidersHorizontal className="h-4 w-4 ml-2" />
          تصفية
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -left-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>تصفية الملفات</SheetTitle>
          <SheetDescription>
            اختر معايير التصفية لإيجاد الملفات التي تبحث عنها
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* File Types */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <h3 className="text-sm font-semibold">نوع الملف</h3>
            </div>
            <div className="space-y-2">
              {fileTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={selectedFileTypes.includes(type.value)}
                    onCheckedChange={(checked) =>
                      handleFileTypeChange(type.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <h3 className="text-sm font-semibold">الوسوم</h3>
            </div>
            <div className="space-y-2">
              {mockTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) =>
                      handleTagChange(tag.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range - Placeholder for future implementation */}
          <div className="space-y-3 opacity-50 pointer-events-none">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <h3 className="text-sm font-semibold">التاريخ</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              سيتم إضافة تصفية حسب التاريخ قريباً
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button onClick={handleApplyFilters} className="flex-1">
            تطبيق التصفية
          </Button>
          <Button onClick={handleClearAll} variant="outline" className="flex-1">
            <X className="ml-2 h-4 w-4" />
            مسح الكل
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

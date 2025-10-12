'use client'

import { useState } from 'react'
import { Button, Input, Label, Card, Switch } from '@repo/ui'
import { QuillEditor } from '../quill-editor'
import { KeywordsInput } from './keywords-input'
import { SummaryInput } from './summary-input'
import { FileUpload } from './file-upload'
import { TimetableCombobox } from '../timetable-combobox'
import { Loader2, Save, X } from 'lucide-react'

interface UploadedFile {
  tempPath: string
  fileName: string
  fileSize: number
  mimeType: string
  originalName: string
}

interface SessionNoteFormData {
  title: string
  content: string
  keywords: string
  notes: string
  summary: string
  isPrivate: boolean
  timetableId: string
  tempAttachments: UploadedFile[]
}

interface SessionNoteFormProps {
  initialData?: Partial<SessionNoteFormData>
  onSubmit: (data: SessionNoteFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
}

export function SessionNoteForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'حفظ',
  isLoading = false,
}: SessionNoteFormProps) {
  const [formData, setFormData] = useState<SessionNoteFormData>({
    title: initialData.title || '',
    content: initialData.content || '',
    keywords: initialData.keywords || '',
    notes: initialData.notes || '',
    summary: initialData.summary || '',
    isPrivate: initialData.isPrivate || false,
    timetableId: initialData.timetableId || '',
    tempAttachments: initialData.tempAttachments || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof SessionNoteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'المحتوى مطلوب'
    }

    if (!formData.timetableId) {
      newErrors.timetableId = 'الجلسة مطلوبة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">المعلومات الأساسية</h3>
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              عنوان الملاحظة <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="أدخل عنوان الملاحظة"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Timetable Selection */}
          <div className="space-y-2">
            <Label htmlFor="timetable">
              الجلسة <span className="text-destructive">*</span>
            </Label>
            <TimetableCombobox
              value={formData.timetableId}
              onChange={(value) => handleChange('timetableId', value || '')}
              disabled={isLoading}
            />
            {errors.timetableId && (
              <p className="text-sm text-destructive">{errors.timetableId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              يتم عرض جلسات الأسبوع الحالي فقط (الإثنين - السبت)
            </p>
          </div>

          {/* Content (for backward compatibility) */}
          <div className="space-y-2">
            <Label htmlFor="content">
              المحتوى <span className="text-destructive">*</span>
            </Label>
            <Input
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="وصف مختصر للملاحظة"
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="privacy">ملاحظة خاصة</Label>
              <p className="text-sm text-muted-foreground">
                الملاحظات الخاصة مرئية لك فقط
              </p>
            </div>
            <Switch
              id="privacy"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => handleChange('isPrivate', checked)}
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>

      {/* Cornell Notes Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ملاحظات كورنيل</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Keywords (Sidebar) */}
          <div className="lg:col-span-1 space-y-2">
            <Label htmlFor="keywords">الكلمات المفتاحية / الأسئلة</Label>
            <KeywordsInput
              value={formData.keywords}
              onChange={(value) => handleChange('keywords', value)}
              placeholder="أضف كلمة مفتاحية..."
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              اضغط Enter لإضافة كلمة مفتاحية
            </p>
          </div>

          {/* Notes (Main Area) */}
          <div className="lg:col-span-2 space-y-2">
            <Label htmlFor="notes">الملاحظات الرئيسية</Label>
            <div className="min-h-[300px]">
              <QuillEditor
                value={formData.notes}
                onChange={(value) => handleChange('notes', value)}
                placeholder="اكتب الملاحظات الرئيسية هنا..."
                readonly={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Summary (Full Width) */}
        <div className="mt-6 space-y-2">
          <Label htmlFor="summary">الملخص</Label>
          <SummaryInput
            value={formData.summary}
            onChange={(value) => handleChange('summary', value)}
            placeholder="اكتب ملخصاً للملاحظات..."
            disabled={isLoading}
          />
        </div>
      </Card>

      {/* Attachments Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">المرفقات</h3>
        <FileUpload
          value={formData.tempAttachments}
          onChange={(files) => handleChange('tempAttachments', files)}
          maxFiles={6}
          disabled={isLoading}
        />
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 ml-1" />
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-1" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

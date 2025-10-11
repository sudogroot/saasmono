'use client'

import { useState, useRef } from 'react'
import { Button } from '@repo/ui'
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadedFile {
  tempPath: string
  fileName: string
  fileSize: number
  mimeType: string
  originalName: string
}

interface FileUploadProps {
  value: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
  disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg',
  'image/jpg',
]

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4" />
  }
  return <FileText className="h-4 w-4" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({ value, onChange, maxFiles = 6, disabled = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check max files limit
    if (value.length + files.length > maxFiles) {
      toast.error(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`)
      return
    }

    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`الملف ${file.name} أكبر من 5 ميغابايت`)
        return
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`الملف ${file.name} غير مدعوم. الأنواع المدعومة: PDF, DOCX, PNG, JPG`)
        return
      }
    }

    // Upload files
    setUploading(true)
    const uploadedFiles: UploadedFile[] = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/management/upload-temp-file', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`فشل رفع الملف ${file.name}`)
        }

        const data = await response.json()
        uploadedFiles.push(data)
      }

      // Add uploaded files to value
      onChange([...value, ...uploadedFiles])

      toast.success(`تم رفع ${uploadedFiles.length} ملف بنجاح`)
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء رفع الملفات')
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || value.length >= maxFiles}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 ml-1" />
              رفع ملفات ({value.length}/{maxFiles})
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          PDF, DOCX, PNG, JPG (حد أقصى 5 ميغابايت)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted/50 rounded p-2 text-sm"
            >
              <div className="text-muted-foreground">
                {getFileIcon(file.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium" title={file.originalName}>
                  {file.originalName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.fileSize)}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

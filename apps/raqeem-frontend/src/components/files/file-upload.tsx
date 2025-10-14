'use client'

import { Button, Card, Progress } from '@repo/ui'
import { Camera, File, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { FileUploadOptions } from './types'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  options?: FileUploadOptions
  disabled?: boolean
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
}

export function FileUpload({ onUpload, options, disabled, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['*/*'],
    allowCamera = true,
    allowMultiple = true,
  } = options || {}

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `الملف كبير جداً. الحد الأقصى: ${(maxSize / 1024 / 1024).toFixed(0)} ميجابايت`
      }

      if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
        const fileType = file.type
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''))
          }
          return fileType === type
        })

        if (!isAccepted) {
          return 'نوع الملف غير مدعوم'
        }
      }

      return null
    },
    [maxSize, acceptedTypes]
  )

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (disabled) return

      const validFiles: File[] = []
      const errors: string[] = []

      files.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        toast.error('بعض الملفات غير صالحة', {
          description: errors.join('\n'),
        })
      }

      if (validFiles.length === 0) return

      // Initialize uploading files with 0% progress
      const newUploadingFiles = validFiles.map((file) => ({
        file,
        progress: 0,
      }))

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      try {
        // Simulate upload progress
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]

          // Simulate progress updates
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            setUploadingFiles((prev) =>
              prev.map((uf) =>
                uf.file === file
                  ? {
                      ...uf,
                      progress,
                    }
                  : uf
              )
            )
          }
        }

        // Call the actual upload handler
        await onUpload(validFiles)

        // Clear uploading files after successful upload
        setUploadingFiles([])

        toast.success(`تم رفع ${validFiles.length} ملف بنجاح`)
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('حدث خطأ أثناء رفع الملفات')

        // Mark files as failed
        setUploadingFiles((prev) =>
          prev.map((uf) =>
            validFiles.includes(uf.file)
              ? {
                  ...uf,
                  error: 'فشل الرفع',
                }
              : uf
          )
        )
      }
    },
    [disabled, validateFile, onUpload]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(Array.from(files))
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    },
    [handleFiles]
  )

  const removeUploadingFile = useCallback((file: File) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file))
  }, [])

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleClickCamera = useCallback(() => {
    cameraInputRef.current?.click()
  }, [])

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled ? handleClickUpload : undefined}
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">رفع الملفات</h3>
              <p className="text-sm text-muted-foreground">
                اسحب وأفلت الملفات هنا أو انقر للاختيار
              </p>
              {maxSize && (
                <p className="text-xs text-muted-foreground">
                  الحد الأقصى لحجم الملف: {(maxSize / 1024 / 1024).toFixed(0)} ميجابايت
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClickUpload()
                }}
                disabled={disabled}
              >
                <File className="ml-2 h-4 w-4" />
                اختر ملفات
              </Button>

              {allowCamera && isMobile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClickCamera()
                  }}
                  disabled={disabled}
                >
                  <Camera className="ml-2 h-4 w-4" />
                  التقط صورة
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptedTypes.join(',')}
        multiple={allowMultiple}
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {allowCamera && isMobile && (
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          disabled={disabled}
        />
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">جاري الرفع...</h4>
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.file.name} className="p-3">
              <div className="flex items-start gap-3">
                <File className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadingFile.file.size / 1024).toFixed(0)} كيلوبايت
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => removeUploadingFile(uploadingFile.file)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploadingFile.error ? (
                    <p className="text-xs text-destructive">{uploadingFile.error}</p>
                  ) : (
                    <div className="space-y-1">
                      <Progress value={uploadingFile.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground text-left">
                        {uploadingFile.progress}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

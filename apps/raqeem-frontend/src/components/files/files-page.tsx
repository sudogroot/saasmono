'use client'

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Heading } from '@repo/ui'
import { FileText, Plus, Upload as UploadIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FileBulkActions } from './file-bulk-actions'
import { FileEditor, type FileEditorFormData } from './file-editor'
import { FileList } from './file-list'
import { FileStats } from './file-stats'
import { FileUpload } from './file-upload'
import { FileViewer } from './file-viewer'
import { mockFiles } from './mocks/files-data'
import type { FileDocument, FileFilters } from './types'

export function FilesPage() {
  const [files, setFiles] = useState<FileDocument[]>(mockFiles)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileDocument | null>(null)
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null)
  const [filters, setFilters] = useState<FileFilters>({})
  const [selectedFiles, setSelectedFiles] = useState<FileDocument[]>([])

  // Handle file upload
  const handleUpload = async (uploadedFiles: File[]) => {
    // Simulate file upload and creation
    const newFiles: FileDocument[] = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      originalName: file.name,
      fileType: file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : 'document',
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'ready',
      uploadedAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      linkedEntities: [],
      uploadedBy: {
        id: 'user-1',
        name: 'أحمد الحارثي',
      },
      metadata:
        file.type.startsWith('image/') && file instanceof File
          ? {
              width: 1920,
              height: 1080,
            }
          : undefined,
    }))

    setFiles([...newFiles, ...files])
    setShowUpload(false)
  }

  // Handle file view
  const handleView = (file: FileDocument) => {
    setSelectedFile(file)
    setViewMode('view')
  }

  // Handle file edit
  const handleEdit = (file: FileDocument) => {
    setSelectedFile(file)
    setViewMode('edit')
  }

  // Handle file download
  const handleDownload = (file: FileDocument) => {
    toast.success(`جاري تحميل ${file.name}`)
    // In a real app, this would trigger an actual download
    window.open(file.url, '_blank')
  }

  // Handle file delete
  const handleDelete = (file: FileDocument) => {
    if (confirm(`هل أنت متأكد من حذف الملف "${file.name}"؟`)) {
      setFiles(files.filter((f) => f.id !== file.id))
      toast.success('تم حذف الملف بنجاح')
      if (selectedFile?.id === file.id) {
        setSelectedFile(null)
        setViewMode(null)
      }
    }
  }

  // Handle file save from editor
  const handleSave = async (data: FileEditorFormData) => {
    if (!selectedFile) return

    // Update file in the list
    setFiles(
      files.map((f) =>
        f.id === selectedFile.id
          ? {
              ...f,
              name: data.name,
              description: data.description,
              tags: data.tags,
              linkedEntities: data.linkedEntities,
              updatedAt: new Date(),
            }
          : f
      )
    )

    // Update selected file
    setSelectedFile({
      ...selectedFile,
      name: data.name,
      description: data.description,
      tags: data.tags,
      linkedEntities: data.linkedEntities,
      updatedAt: new Date(),
    })

    setViewMode('view')
  }

  // Handle bulk download
  const handleBulkDownload = (filesToDownload: FileDocument[]) => {
    toast.success(`جاري تحميل ${filesToDownload.length} ملف`)
    filesToDownload.forEach((file) => {
      window.open(file.url, '_blank')
    })
  }

  // Handle bulk delete
  const handleBulkDelete = (filesToDelete: FileDocument[]) => {
    if (confirm(`هل أنت متأكد من حذف ${filesToDelete.length} ملف؟`)) {
      const deletedIds = filesToDelete.map((f) => f.id)
      setFiles(files.filter((f) => !deletedIds.includes(f.id)))
      setSelectedFiles([])
      toast.success(`تم حذف ${filesToDelete.length} ملف بنجاح`)
    }
  }

  // Handle bulk tag
  const handleBulkTag = (filesToTag: FileDocument[]) => {
    toast.info('سيتم إضافة ميزة الوسم الجماعي قريباً')
  }

  // Handle bulk archive
  const handleBulkArchive = (filesToArchive: FileDocument[]) => {
    toast.info('سيتم إضافة ميزة الأرشفة قريباً')
  }

  // Close dialog
  const handleCloseDialog = () => {
    setSelectedFile(null)
    setViewMode(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <Heading level={2} className="text-2xl sm:text-3xl">
              الملفات
            </Heading>
            <p className="text-sm text-muted-foreground">إدارة جميع ملفات القضايا والعملاء</p>
          </div>
        </div>

        <Button onClick={() => setShowUpload(true)} size="lg" className="w-full sm:w-auto">
          <Plus className="ml-2 h-5 w-5" />
          رفع ملفات
        </Button>
      </div>

      {/* Stats */}
      <FileStats files={files} />

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              رفع ملفات جديدة
            </DialogTitle>
          </DialogHeader>
          <FileUpload
            onUpload={handleUpload}
            options={{
              allowMultiple: true,
              allowCamera: true,
              maxSize: 10 * 1024 * 1024, // 10MB
            }}
          />
        </DialogContent>
      </Dialog>

      {/* File List */}
      <FileList
        files={files}
        onView={handleView}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onDelete={handleDelete}
        filters={filters}
        onFiltersChange={setFilters}
        selectedFiles={selectedFiles}
        onSelectionChange={setSelectedFiles}
      />

      {/* Bulk Actions */}
      <FileBulkActions
        selectedFiles={selectedFiles}
        onClearSelection={() => setSelectedFiles([])}
        onBulkDownload={handleBulkDownload}
        onBulkDelete={handleBulkDelete}
        onBulkTag={handleBulkTag}
        onBulkArchive={handleBulkArchive}
      />

      {/* File View/Edit Dialog */}
      <Dialog open={viewMode !== null} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedFile && viewMode === 'view' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تفاصيل الملف
                </DialogTitle>
              </DialogHeader>
              <FileViewer
                file={selectedFile}
                onEdit={() => setViewMode('edit')}
                onDownload={() => handleDownload(selectedFile)}
                onClose={handleCloseDialog}
              />
            </>
          )}

          {selectedFile && viewMode === 'edit' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تعديل الملف
                </DialogTitle>
              </DialogHeader>
              <FileEditor
                file={selectedFile}
                onSave={handleSave}
                onCancel={() => setViewMode('view')}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

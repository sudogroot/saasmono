// File management types for lawyer SaaS platform

export type FileType = 'document' | 'image' | 'pdf' | 'video' | 'audio' | 'other'

export type FileStatus = 'uploading' | 'processing' | 'ready' | 'failed'

export type LinkableEntityType = 'case' | 'trial' | 'client' | 'opponent'

export interface FileTag {
  id: string
  name: string
  color?: string
}

export interface LinkedEntity {
  id: string
  type: LinkableEntityType
  name: string
  metadata?: any
}

export interface FileDocument {
  id: string
  name: string
  originalName: string
  fileType: FileType
  mimeType: string
  size: number // bytes
  url: string
  thumbnailUrl?: string
  status: FileStatus
  uploadedAt: Date
  updatedAt: Date

  // Metadata
  description?: string
  tags: FileTag[]
  linkedEntities: LinkedEntity[]

  // User info
  uploadedBy: {
    id: string
    name: string
  }

  // Additional metadata
  metadata?: {
    width?: number
    height?: number
    duration?: number
    pageCount?: number
  }
}

export interface FileUploadOptions {
  maxSize?: number // bytes
  acceptedTypes?: string[]
  allowCamera?: boolean
  allowMultiple?: boolean
}

export interface FileFilters {
  search?: string
  fileType?: FileType[]
  tags?: string[]
  linkedEntityType?: LinkableEntityType
  linkedEntityId?: string
  dateFrom?: Date
  dateTo?: Date
}

// Export all file management components
export { FileUpload } from './file-upload'
export { FileCard } from './file-card'
export { FileList } from './file-list'
export { FileViewer } from './file-viewer'
export { FileEditor } from './file-editor'
export { FilesPage } from './files-page'
export { FileStats } from './file-stats'
export { FileBulkActions } from './file-bulk-actions'
export { FileFilters as FileFiltersDialog } from './file-filters'

// Export types
export type {
  FileType,
  FileStatus,
  LinkableEntityType,
  FileTag,
  LinkedEntity,
  FileDocument,
  FileUploadOptions,
  FileFilters,
} from './types'

export type { FileEditorFormData } from './file-editor'

// Export mock data and utilities
export {
  mockFiles,
  mockTags,
  formatFileSize,
  getFileIcon,
  getFileTypeLabel,
} from './mocks/files-data'

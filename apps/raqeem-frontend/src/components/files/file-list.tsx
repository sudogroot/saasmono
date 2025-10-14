'use client'

import { Button, Checkbox, Input } from '@repo/ui'
import { CheckSquare, Grid, List, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FileCard } from './file-card'
import { FileFilters as FileFiltersComponent } from './file-filters'
import type { FileDocument, FileFilters } from './types'

interface FileListProps {
  files: FileDocument[]
  onView?: (file: FileDocument) => void
  onEdit?: (file: FileDocument) => void
  onDownload?: (file: FileDocument) => void
  onDelete?: (file: FileDocument) => void
  filters?: FileFilters
  onFiltersChange?: (filters: FileFilters) => void
  selectedFiles?: FileDocument[]
  onSelectionChange?: (files: FileDocument[]) => void
  className?: string
}

export function FileList({
  files,
  onView,
  onEdit,
  onDownload,
  onDelete,
  filters,
  onFiltersChange,
  selectedFiles = [],
  onSelectionChange,
  className,
}: FileListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(filters?.search || '')
  const [selectionMode, setSelectionMode] = useState(false)

  // Filter files based on search query and other filters
  const filteredFiles = useMemo(() => {
    let result = files

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query) ||
          file.tags.some((tag) => tag.name.toLowerCase().includes(query)) ||
          file.linkedEntities.some((entity) => entity.name.toLowerCase().includes(query))
      )
    }

    // File type filter
    if (filters?.fileType && filters.fileType.length > 0) {
      result = result.filter((file) => filters.fileType!.includes(file.fileType))
    }

    // Tags filter
    if (filters?.tags && filters.tags.length > 0) {
      result = result.filter((file) =>
        file.tags.some((tag) => filters.tags!.includes(tag.id))
      )
    }

    // Linked entity filter
    if (filters?.linkedEntityType && filters?.linkedEntityId) {
      result = result.filter((file) =>
        file.linkedEntities.some(
          (entity) =>
            entity.type === filters.linkedEntityType && entity.id === filters.linkedEntityId
        )
      )
    }

    // Date range filter
    if (filters?.dateFrom) {
      result = result.filter((file) => new Date(file.uploadedAt) >= filters.dateFrom!)
    }

    if (filters?.dateTo) {
      result = result.filter((file) => new Date(file.uploadedAt) <= filters.dateTo!)
    }

    return result
  }, [files, searchQuery, filters])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFiltersChange?.({ ...filters, search: value })
  }

  const handleSelect = (file: FileDocument, selected: boolean) => {
    if (!onSelectionChange) return

    if (selected) {
      onSelectionChange([...selectedFiles, file])
    } else {
      onSelectionChange(selectedFiles.filter((f) => f.id !== file.id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange(filteredFiles)
    } else {
      onSelectionChange([])
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    onFiltersChange?.({})
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      onSelectionChange?.([])
    }
  }

  const isFileSelected = (file: FileDocument) => {
    return selectedFiles.some((f) => f.id === file.id)
  }

  const allSelected = filteredFiles.length > 0 && filteredFiles.every((f) => isFileSelected(f))

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث في الملفات..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-10 px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-10 px-3"
          >
            <List className="h-4 w-4" />
          </Button>

          {/* Selection Toggle */}
          {onSelectionChange && (
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              size="sm"
              onClick={toggleSelectionMode}
              className="h-10 px-3"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          )}

          {/* Filters */}
          {onFiltersChange && (
            <FileFiltersComponent
              filters={filters || {}}
              onFiltersChange={onFiltersChange}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>

      {/* Select All - Show in selection mode */}
      {selectionMode && onSelectionChange && filteredFiles.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            تحديد الكل ({filteredFiles.length})
          </span>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredFiles.length === files.length ? (
          <span>
            عرض {filteredFiles.length} {filteredFiles.length === 1 ? 'ملف' : 'ملفات'}
          </span>
        ) : (
          <span>
            عرض {filteredFiles.length} من {files.length}{' '}
            {files.length === 1 ? 'ملف' : 'ملفات'}
          </span>
        )}
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              variant={viewMode}
              onView={onView}
              onEdit={onEdit}
              onDownload={onDownload}
              onDelete={onDelete}
              isSelected={isFileSelected(file)}
              onSelect={handleSelect}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">لا توجد ملفات</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? 'لم يتم العثور على ملفات مطابقة لبحثك'
              : 'لم يتم رفع أي ملفات بعد'}
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { Card } from '@repo/ui'
import { File, FileText, HardDrive, Image } from 'lucide-react'
import { useMemo } from 'react'
import { formatFileSize } from './mocks/files-data'
import type { FileDocument } from './types'

interface FileStatsProps {
  files: FileDocument[]
  className?: string
}

export function FileStats({ files, className }: FileStatsProps) {
  const stats = useMemo(() => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const pdfCount = files.filter((f) => f.fileType === 'pdf').length
    const imageCount = files.filter((f) => f.fileType === 'image').length
    const documentCount = files.filter((f) => f.fileType === 'document').length
    const otherCount = files.length - pdfCount - imageCount - documentCount

    return {
      total: files.length,
      totalSize,
      pdfCount,
      imageCount,
      documentCount,
      otherCount,
    }
  }, [files])

  const statCards = [
    {
      label: 'إجمالي الملفات',
      value: stats.total,
      icon: File,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'المستندات والصور',
      value: stats.imageCount + stats.documentCount,
      icon: Image,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'ملفات PDF',
      value: stats.pdfCount,
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'إجمالي المساحة',
      value: formatFileSize(stats.totalSize),
      icon: HardDrive,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor} shrink-0`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

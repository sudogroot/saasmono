'use client'

import { FilesPage } from '@/components/files'
import { Heading, Text } from '@repo/ui'
import { FileText, FolderOpen, Upload, Search, Tag, Archive } from 'lucide-react'

// Coming Soon Component
function ComingSoonFiles() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center p-4" dir="rtl">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col items-center gap-6">
          {/* Icon and Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-2xl p-4">
              <FileText className="text-primary h-12 w-12" />
            </div>
            <div className="bg-primary/15 text-primary rounded-full px-4 py-1.5 text-xs font-medium animate-pulse">
              قريباً
            </div>
          </div>

          {/* Title */}
          <Heading level={1}>إدارة الملفات</Heading>

          {/* Files Preview */}
          <div className="bg-card w-full max-w-md rounded-xl border shadow-sm">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <Text as="span" size="sm" className="font-medium">ملفاتي</Text>
                <div className="flex gap-1">
                  <div className="bg-muted h-6 w-6 rounded"></div>
                  <div className="bg-muted h-6 w-6 rounded"></div>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-2">
              {[
                { icon: FolderOpen, name: 'قضايا 2025', count: '24 ملف' },
                { icon: FileText, name: 'مستندات قانونية', count: '18 ملف' },
                { icon: Archive, name: 'أرشيف', count: '156 ملف' },
              ].map((folder) => (
                <div key={folder.name} className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 p-3 rounded transition-colors">
                  <folder.icon className="text-primary h-5 w-5" />
                  <div className="flex-1">
                    <Text as="span" size="sm" className="font-medium">{folder.name}</Text>
                  </div>
                  <Text as="span" size="xs" className="text-muted-foreground">{folder.count}</Text>
                </div>
              ))}
            </div>

            <div className="border-t px-4 py-2">
              <div className="flex items-center gap-2">
                <Upload className="text-primary h-3 w-3" />
                <Text as="span" size="xs" className="text-muted-foreground">رفع الملفات</Text>
                <Search className="text-amber-600 mr-auto h-3 w-3" />
                <Text as="span" size="xs" className="text-muted-foreground">بحث متقدم</Text>
                <Tag className="text-green-600 mr-2 h-3 w-3" />
                <Text as="span" size="xs" className="text-muted-foreground">وسوم ذكية</Text>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="bg-primary h-1 w-6 rounded-full"></div>
              <div className="bg-primary h-1 w-6 rounded-full"></div>
              <div className="bg-primary/30 h-1 w-6 rounded-full"></div>
            </div>
            <Text as="span" size="xs" className="text-muted-foreground">قيد التطوير</Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FilesRoute() {
  // Check feature flag from environment variable
  const isFilesEnabled = process.env.NEXT_PUBLIC_ENABLE_FILES === 'true'

  if (!isFilesEnabled) {
    return <ComingSoonFiles />
  }

  return <FilesPage />
}

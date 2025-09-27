'use client'

import { ParentsTable } from '@/components/parents/parents-table'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

export default function Parents() {
  const isMobile = useIsMobile()

  const handleEditParent = (parentId: string) => {
    console.log('Edit parent:', parentId)
    // TODO: Implement edit functionality
  }

  const handleCreateNewParent = () => {
    console.log('Create new parent')
    // TODO: Implement create functionality
  }

  if (isMobile) {
    return <ParentsTable onEdit={handleEditParent} onCreateNew={handleCreateNewParent} />
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة أولياء الأمور</h1>
          <p className="text-muted-foreground">إدارة أولياء الأمور وعلاقاتهم مع الطلاب</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>أولياء الأمور</CardTitle>
          <CardDescription>إدارة قائمة أولياء الأمور ومعلوماتهم الشخصية وعلاقاتهم مع الأطفال</CardDescription>
        </CardHeader>
        <CardContent>
          <ParentsTable onEdit={handleEditParent} onCreateNew={handleCreateNewParent} />
        </CardContent>
      </Card>
    </div>
  )
}
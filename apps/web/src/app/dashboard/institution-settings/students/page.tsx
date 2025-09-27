'use client'

import { StudentsTable } from '@/components/students/students-table'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

export default function Students() {
  const isMobile = useIsMobile()

  const handleEditStudent = (studentId: string) => {
    console.log('Edit student:', studentId)
    // TODO: Implement edit functionality
  }

  const handleViewStudent = (studentId: string) => {
    console.log('View student:', studentId)
    // TODO: Implement view functionality
  }

  const handleCreateNewStudent = () => {
    console.log('Create new student')
    // TODO: Implement create functionality
  }

  if (isMobile) {
    return <StudentsTable onEdit={handleEditStudent} onCreateNew={handleCreateNewStudent} />
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الطلاب</h1>
          <p className="text-muted-foreground">إدارة قائمة الطلاب ومعلوماتهم الشخصية والأكاديمية</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>الطلاب</CardTitle>
          <CardDescription>إدارة قائمة الطلاب ومعلوماتهم الشخصية وأولياء الأمور والانتساب للفصول</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsTable onEdit={handleEditStudent} onCreateNew={handleCreateNewStudent} />
        </CardContent>
      </Card>
    </div>
  )
}
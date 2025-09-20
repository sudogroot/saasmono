'use client'

import { TeachersTable } from '@/components/teachers/teachers-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui'
import { BookOpen, GraduationCap, Settings, Users } from 'lucide-react'

export default function Teachers() {
  const handleEditTeacher = (teacherId: string) => {
    console.log('Edit teacher:', teacherId)
    // TODO: Implement edit functionality
  }

  const handleViewTeacher = (teacherId: string) => {
    console.log('View teacher:', teacherId)
    // TODO: Implement view functionality
  }

  const handleCreateNewTeacher = () => {
    console.log('Create new teacher')
    // TODO: Implement create functionality
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المعلمين</h1>
          <p className="text-muted-foreground">إدارة الهيئة التدريسية وتكليفاتهم التعليمية</p>
        </div>
      </div>

      <Tabs defaultValue="teachers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المعلمين
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            التكليفات التدريسية
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            تقييم الأداء
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات المعلمين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعلمين</CardTitle>
              <CardDescription>إدارة قائمة المعلمين ومعلوماتهم الشخصية والمهنية</CardDescription>
            </CardHeader>
            <CardContent>
              <TeachersTable
                onEdit={handleEditTeacher}
                onView={handleViewTeacher}
                onCreateNew={handleCreateNewTeacher}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التكليفات التدريسية</CardTitle>
              <CardDescription>إدارة تكليفات المعلمين للمواد الدراسية والفصول</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="space-y-4 text-center">
                  <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <BookOpen className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">التكليفات التدريسية</h3>
                    <p className="text-muted-foreground mt-1">سيتم إضافة إدارة التكليفات التدريسية قريباً</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقييم الأداء</CardTitle>
              <CardDescription>متابعة وتقييم أداء المعلمين وإنجازاتهم التدريسية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="space-y-4 text-center">
                  <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <GraduationCap className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">تقييم الأداء</h3>
                    <p className="text-muted-foreground mt-1">سيتم إضافة نظام تقييم الأداء قريباً</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المعلمين</CardTitle>
              <CardDescription>إعدادات عامة متعلقة بإدارة المعلمين والهيئة التدريسية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="space-y-4 text-center">
                  <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <Settings className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">إعدادات المعلمين</h3>
                    <p className="text-muted-foreground mt-1">سيتم إضافة إعدادات المعلمين قريباً</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
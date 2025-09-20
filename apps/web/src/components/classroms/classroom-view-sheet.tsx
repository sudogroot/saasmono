'use client'

import { Badge, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@repo/ui'
import { Building2, Calendar, GraduationCap, Users, BookOpen } from 'lucide-react'

interface EducationLevel {
  id: string
  level: number
  section: string | null
  displayNameAr: string | null
}

interface ClassroomListItem {
  id: string
  name: string
  academicYear: string
  educationLevelId: string
  educationLevel: EducationLevel
  studentCount: number
  teacherCount: number
}

interface ClassroomViewSheetProps {
  classroom: ClassroomListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClassroomViewSheet({ classroom, open, onOpenChange }: ClassroomViewSheetProps) {
  if (!classroom) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent isMobileSheet className="sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Building2 className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg">
                {classroom.name}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {classroom.academicYear}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <SheetBody>
          <div dir="rtl" className="py-2">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">المعلومات الأساسية</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">اسم الفصل</span>
                  <span className="text-sm font-medium">{classroom.name}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">السنة الأكاديمية</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {classroom.academicYear}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">معرف الفصل</span>
                  <span className="text-xs text-muted-foreground font-mono">{classroom.id}</span>
                </div>
              </div>
            </div>

            {/* Education Level Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">المرحلة التعليمية</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">المستوى {classroom.educationLevel.level}</div>
                    {classroom.educationLevel.section && (
                      <div className="text-xs text-muted-foreground">{classroom.educationLevel.section}</div>
                    )}
                  </div>
                </div>

                {classroom.educationLevel.displayNameAr && (
                  <div className="px-3 py-2 bg-muted/50 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">اسم المرحلة</div>
                    <div className="text-sm font-medium">
                      {classroom.educationLevel.displayNameAr}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  معرف المرحلة: {classroom.educationLevel.id}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">إحصائيات الفصل</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-semibold text-blue-600">{classroom.studentCount}</div>
                  <div className="text-muted-foreground text-xs">طالب</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-semibold text-green-600">{classroom.teacherCount}</div>
                  <div className="text-muted-foreground text-xs">معلم</div>
                </div>
              </div>
            </div>

            {/* Status and Capacity */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">حالة الفصل</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">عدد الطلاب</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {classroom.studentCount} طالب
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">عدد المعلمين</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {classroom.teacherCount} معلم
                  </Badge>
                </div>

                {/* Activity Status */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">حالة الفصل</span>
                  </div>
                  <Badge variant="default" className="text-xs bg-green-600">
                    نشط
                  </Badge>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">معلومات إضافية</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="text-xs text-blue-700 mb-1">نسبة الطلاب إلى المعلمين</div>
                  <div className="text-sm font-medium text-blue-800">
                    {classroom.teacherCount > 0
                      ? `${Math.round(classroom.studentCount / classroom.teacherCount)} طالب لكل معلم`
                      : 'لا يوجد معلمين مُعيَّنين'
                    }
                  </div>
                </div>

                {classroom.studentCount === 0 && (
                  <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                    <div className="text-xs text-orange-700 mb-1">تنبيه</div>
                    <div className="text-sm font-medium text-orange-800">
                      لا يوجد طلاب مسجلين في هذا الفصل
                    </div>
                  </div>
                )}

                {classroom.teacherCount === 0 && (
                  <div className="p-3 bg-red-50 rounded-md border border-red-200">
                    <div className="text-xs text-red-700 mb-1">تنبيه</div>
                    <div className="text-sm font-medium text-red-800">
                      لا يوجد معلمين مُعيَّنين لهذا الفصل
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
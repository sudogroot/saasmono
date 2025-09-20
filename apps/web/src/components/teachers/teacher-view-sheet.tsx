'use client'

import { Badge } from '@repo/ui'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui'
import { BookOpen, Building2, Calendar, Mail, Shield, User } from 'lucide-react'

interface TeacherSubjectAssignment {
  id: string
  name: string
  displayNameAr: string
  role: string
  isMainTeacher: boolean
  assignmentId: string
}

interface TeacherClassroom {
  id: string
  name: string
  code: string
  academicYear: string
  educationLevel: {
    id: string
    level: number
    displayNameAr: string | null
  }
  subjects: TeacherSubjectAssignment[]
}

interface TeacherWithAssignments {
  id: string
  name: string
  lastName: string
  email: string
  userType: 'teacher'
  createdAt: Date
  updatedAt: Date
  classrooms: TeacherClassroom[]
}

interface TeacherViewSheetProps {
  teacher: TeacherWithAssignments | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeacherViewSheet({ teacher, open, onOpenChange }: TeacherViewSheetProps) {
  if (!teacher) return null

  const totalSubjects = teacher.classrooms.reduce((sum, classroom) => sum + classroom.subjects.length, 0)
  const mainSubjects = teacher.classrooms.reduce(
    (sum, classroom) => sum + classroom.subjects.filter(s => s.isMainTeacher).length,
    0
  )
  const assistantSubjects = totalSubjects - mainSubjects

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <User className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg">
                {teacher.name} {teacher.lastName}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {teacher.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 p-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">المعلومات الأساسية</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">نوع المستخدم</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  معلم
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">تاريخ الانضمام</span>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(teacher.createdAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">آخر تحديث</span>
                <div className="text-sm text-muted-foreground">
                  {new Date(teacher.updatedAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">إحصائيات التكليفات</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-primary">{teacher.classrooms.length}</div>
                <div className="text-xs text-muted-foreground">فصل دراسي</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-primary">{totalSubjects}</div>
                <div className="text-xs text-muted-foreground">مادة تدريسية</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-green-600">{mainSubjects}</div>
                <div className="text-xs text-muted-foreground">معلم رئيسي</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-blue-600">{assistantSubjects}</div>
                <div className="text-xs text-muted-foreground">معلم مساعد</div>
              </div>
            </div>
          </div>

          {/* Classroom Assignments */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">التكليفات الدراسية</h3>
            {teacher.classrooms.length > 0 ? (
              <div className="space-y-3">
                {teacher.classrooms.map((classroom) => (
                  <div key={classroom.id} className="rounded-lg border p-4 space-y-3">
                    {/* Classroom Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{classroom.name}</div>
                          <div className="text-xs text-muted-foreground">{classroom.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          المستوى {classroom.educationLevel.level}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {classroom.academicYear}
                        </div>
                      </div>
                    </div>

                    {/* Education Level */}
                    {classroom.educationLevel.displayNameAr && (
                      <div className="px-3 py-2 bg-muted/50 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">المرحلة التعليمية</div>
                        <div className="text-sm font-medium">
                          {classroom.educationLevel.displayNameAr}
                        </div>
                      </div>
                    )}

                    {/* Subjects */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        المواد التدريسية ({classroom.subjects.length})
                      </div>
                      <div className="space-y-2">
                        {classroom.subjects.map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                            <div>
                              <div className="text-sm font-medium">{subject.displayNameAr}</div>
                              <div className="text-xs text-muted-foreground">{subject.name}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant={subject.isMainTeacher ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {subject.isMainTeacher ? "معلم رئيسي" : "معلم مساعد"}
                              </Badge>
                              {subject.role !== 'teacher' && (
                                <Badge variant="outline" className="text-xs">
                                  {subject.role === 'assistant' ? 'مساعد تدريس' : subject.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  لا توجد تكليفات دراسية
                </div>
              </div>
            )}
          </div>

          {/* Academic Years Summary */}
          {teacher.classrooms.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">السنوات الأكاديمية</h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set(teacher.classrooms.map(c => c.academicYear))].map((year) => (
                  <Badge key={year} variant="outline" className="text-xs">
                    {year}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
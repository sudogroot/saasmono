'use client'

import { formatDate } from '@/lib/date'
import { orpc } from '@/utils/orpc'
import { Badge, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Building2, Calendar, GraduationCap, Heart, Mail, Shield, User, Users } from 'lucide-react'

interface ParentChild {
  id: string
  name: string
  lastName: string
  email: string
  createdAt: Date
  relationshipType: string
  relationId: string
  relationCreatedAt: Date
  classroom: {
    id: string
    name: string
    code: string
    academicYear: string
    enrollmentStatus: string
    enrollmentDate: Date
    educationLevel: {
      id: string
      level: number
      displayNameAr: string | null
    }
  } | null
}

interface ParentWithChildren {
  id: string
  name: string
  lastName: string
  email: string
  userType: 'parent'
  createdAt: Date
  updatedAt: Date
  children: ParentChild[]
}

interface ParentViewSheetProps {
  parent: ParentWithChildren | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ParentViewSheet({ parent, open, onOpenChange }: ParentViewSheetProps) {
  const { data: detailedParent, isLoading } = useQuery({
    ...orpc.management.parents.getParentById.queryOptions({ input: { parentId: parent?.id || '' } }),
    enabled: !!parent?.id && open && parent.id.length > 0,
  })

  if (!parent) return null

  const parentData = detailedParent || parent
  const totalChildren = parentData.children.length
  const enrolledChildren = parentData.children.filter(c => c.classroom).length
  const academicYears = [...new Set(
    parentData.children
      .filter(c => c.classroom)
      .map(c => c.classroom!.academicYear)
  )]
  const educationLevels = [...new Set(
    parentData.children
      .filter(c => c.classroom)
      .map(c => c.classroom!.educationLevel.level)
  )]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent isMobileSheet className="sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Heart className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg">
                {parentData.name} {parentData.lastName}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {parentData.email}
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
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">الاسم الكامل</span>
                  </div>
                  <span className="text-sm font-medium">{parentData.name} {parentData.lastName}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">البريد الإلكتروني</span>
                  </div>
                  <span className="text-sm font-medium">{parentData.email}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">نوع المستخدم</span>
                  </div>
                  <Badge variant="outline">ولي أمر</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">تاريخ التسجيل</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDate(parentData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-3 mt-6">
              <h3 className="text-muted-foreground text-sm font-medium">إحصائيات الأطفال</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-primary text-lg font-semibold">{totalChildren}</div>
                  <div className="text-muted-foreground text-xs">إجمالي الأطفال</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-green-600 text-lg font-semibold">{enrolledChildren}</div>
                  <div className="text-muted-foreground text-xs">مسجل في فصل</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-blue-600 text-lg font-semibold">{academicYears.length}</div>
                  <div className="text-muted-foreground text-xs">عام أكاديمي</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-purple-600 text-lg font-semibold">{educationLevels.length}</div>
                  <div className="text-muted-foreground text-xs">مستوى تعليمي</div>
                </div>
              </div>
            </div>

            {/* Children Information */}
            <div className="space-y-3 mt-6">
              <h3 className="text-muted-foreground text-sm font-medium">
                الأطفال ({parentData.children.length})
              </h3>
              {parentData.children.length > 0 ? (
                <div className="space-y-3">
                  {parentData.children.map((child) => (
                    <div key={child.id} className="space-y-3 rounded-lg border p-4">
                      {/* Child Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="text-muted-foreground h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium">{child.name} {child.lastName}</div>
                            <div className="text-muted-foreground text-xs">{child.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {child.relationshipType === 'parent' ? 'ابن/ابنة' : child.relationshipType}
                          </Badge>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {formatDate(child.relationCreatedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Classroom Information */}
                      {child.classroom ? (
                        <div className="space-y-2">
                          <div className="bg-muted/50 rounded-md px-3 py-2">
                            <div className="text-muted-foreground mb-1 text-xs">معلومات الفصل</div>
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="text-muted-foreground h-3 w-3" />
                              <span className="text-sm font-medium">{child.classroom.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {child.classroom.code}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="text-muted-foreground h-3 w-3" />
                              <span className="text-xs">
                                المستوى {child.classroom.educationLevel.level}
                                {child.classroom.educationLevel.displayNameAr &&
                                  ` - ${child.classroom.educationLevel.displayNameAr}`
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground h-3 w-3" />
                              <span className="text-xs">{child.classroom.academicYear}</span>
                              <Badge
                                variant={
                                  child.classroom.enrollmentStatus === 'active' ? 'default' :
                                  child.classroom.enrollmentStatus === 'inactive' ? 'secondary' :
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {child.classroom.enrollmentStatus === 'active' ? 'نشط' :
                                 child.classroom.enrollmentStatus === 'inactive' ? 'غير نشط' :
                                 child.classroom.enrollmentStatus === 'transferred' ? 'محول' :
                                 child.classroom.enrollmentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/30 rounded-md p-3 text-center">
                          <Building2 className="text-muted-foreground mx-auto h-6 w-6 mb-1" />
                          <div className="text-muted-foreground text-xs">غير مسجل في أي فصل</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Users className="text-muted-foreground mx-auto h-8 w-8" />
                  <p className="text-muted-foreground mt-2 text-sm">
                    لا توجد علاقات أطفال مسجلة
                  </p>
                </div>
              )}
            </div>

            {/* Academic Years Summary */}
            {academicYears.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-muted-foreground text-sm font-medium">السنوات الأكاديمية</h3>
                <div className="flex flex-wrap gap-2">
                  {academicYears.map((year) => (
                    <Badge key={year} variant="outline" className="text-xs">
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education Levels Summary */}
            {educationLevels.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-muted-foreground text-sm font-medium">المستويات التعليمية</h3>
                <div className="flex flex-wrap gap-2">
                  {educationLevels.map((level) => (
                    <Badge key={level} variant="secondary" className="text-xs">
                      المستوى {level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
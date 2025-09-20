'use client'

import { Badge, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@repo/ui'
import { BookOpen, GraduationCap, Hash, FileText, Star } from 'lucide-react'

interface EducationLevel {
  id: string
  level: number
  section: string | null
  displayNameAr: string | null
  isOptional: boolean
}

interface EducationSubject {
  id: string
  name: string
  displayNameAr: string
  displayDescriptionAr: string | null
  institutionLevelId: string
  educationLevels: EducationLevel[]
}

interface EducationSubjectViewSheetProps {
  subject: EducationSubject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EducationSubjectViewSheet({ subject, open, onOpenChange }: EducationSubjectViewSheetProps) {
  if (!subject) return null

  const optionalLevels = subject.educationLevels.filter(level => level.isOptional)
  const requiredLevels = subject.educationLevels.filter(level => !level.isOptional)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent isMobileSheet className="sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg">
                {subject.displayNameAr}
              </SheetTitle>
              <SheetDescription>
                {subject.name}
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
                  <span className="text-muted-foreground text-sm">الاسم العربي</span>
                  <span className="text-sm font-medium">{subject.displayNameAr}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">الاسم الإنجليزي</span>
                  <span className="text-sm font-medium">{subject.name}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">معرف المادة</span>
                  <span className="text-xs text-muted-foreground font-mono">{subject.id}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">معرف المؤسسة</span>
                  <span className="text-xs text-muted-foreground font-mono">{subject.institutionLevelId}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {subject.displayDescriptionAr && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium">وصف المادة</h3>
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm leading-relaxed">{subject.displayDescriptionAr}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">إحصائيات المادة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-semibold text-primary">{subject.educationLevels.length}</div>
                  <div className="text-muted-foreground text-xs">مستوى تعليمي</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-semibold text-green-600">{requiredLevels.length}</div>
                  <div className="text-muted-foreground text-xs">مستوى إجباري</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-semibold text-orange-600">{optionalLevels.length}</div>
                  <div className="text-muted-foreground text-xs">مستوى اختياري</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {[...new Set(subject.educationLevels.map(l => l.section))].filter(Boolean).length}
                  </div>
                  <div className="text-muted-foreground text-xs">شعبة</div>
                </div>
              </div>
            </div>

            {/* Required Education Levels */}
            {requiredLevels.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium">المستويات الإجبارية</h3>
                <div className="space-y-2">
                  {requiredLevels.map((level) => (
                    <div key={level.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-green-800">المستوى {level.level}</div>
                          {level.section && (
                            <div className="text-xs text-green-600">{level.section}</div>
                          )}
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs bg-green-600">
                        إجباري
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Education Levels */}
            {optionalLevels.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium">المستويات الاختيارية</h3>
                <div className="space-y-2">
                  {optionalLevels.map((level) => (
                    <div key={level.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-orange-600" />
                        <div>
                          <div className="text-sm font-medium text-orange-800">المستوى {level.level}</div>
                          {level.section && (
                            <div className="text-xs text-orange-600">{level.section}</div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        اختياري
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Level Details */}
            {subject.educationLevels.some(l => l.displayNameAr) && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium">تفاصيل المستويات</h3>
                <div className="space-y-2">
                  {subject.educationLevels
                    .filter(level => level.displayNameAr)
                    .map((level) => (
                      <div key={level.id} className="p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">المستوى {level.level}</span>
                          {level.isOptional && (
                            <Badge variant="outline" className="text-xs">اختياري</Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium">{level.displayNameAr}</div>
                        {level.section && (
                          <div className="text-xs text-muted-foreground mt-1">
                            الشعبة: {level.section}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">ملخص المادة</h3>
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>{subject.displayNameAr}</strong> هي مادة دراسية متاحة في{' '}
                  <strong>{subject.educationLevels.length}</strong> مستوى تعليمي
                  {requiredLevels.length > 0 && (
                    <>، منها <strong>{requiredLevels.length}</strong> مستوى إجباري</>
                  )}
                  {optionalLevels.length > 0 && (
                    <>، و<strong>{optionalLevels.length}</strong> مستوى اختياري</>
                  )}.
                </div>
              </div>
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
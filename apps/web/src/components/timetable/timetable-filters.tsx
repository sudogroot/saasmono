'use client'

import { orpc } from '@/utils/orpc'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Building2, Users, X } from 'lucide-react'
import { TimetableFilterState } from './timetable-visualization'

interface TimetableFiltersProps {
  filters: TimetableFilterState
  onFiltersChange: (filters: TimetableFilterState) => void
}

export function TimetableFilters({ filters, onFiltersChange }: TimetableFiltersProps) {
  // Get classrooms list
  const { data: classrooms = [] } = useQuery(
    orpc.management.classroom.getClassroomsList.queryOptions()
  )

  // Get classroom groups - we'll need to implement this API later
  // For now, we'll mock some data or disable this filter
  const classroomGroups: Array<{ id: string; name: string; classroomName: string }> = []

  const handleClassroomChange = (classroomId: string) => {
    if (classroomId === 'clear') {
      onFiltersChange({
        ...filters,
        classroomId: undefined,
      })
    } else {
      onFiltersChange({
        ...filters,
        classroomId,
        classroomGroupId: undefined, // Clear group when classroom is selected
      })
    }
  }

  const handleClassroomGroupChange = (classroomGroupId: string) => {
    if (classroomGroupId === 'clear') {
      onFiltersChange({
        ...filters,
        classroomGroupId: undefined,
      })
    } else {
      onFiltersChange({
        ...filters,
        classroomGroupId,
        classroomId: undefined, // Clear classroom when group is selected
      })
    }
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = filters.classroomId || filters.classroomGroupId

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Classroom Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            الفصل الدراسي
          </label>
          <Select
            value={filters.classroomId || ''}
            onValueChange={handleClassroomChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر فصل دراسي" />
            </SelectTrigger>
            <SelectContent>
              {filters.classroomId && (
                <SelectItem value="clear" className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <X className="h-3 w-3" />
                    مسح الاختيار
                  </div>
                </SelectItem>
              )}
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  <div className="flex flex-col">
                    <span>{classroom.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {classroom.educationLevel.displayNameAr} - {classroom.academicYear}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classroom Group Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            مجموعة الفصل
          </label>
          <Select
            value={filters.classroomGroupId || ''}
            onValueChange={handleClassroomGroupChange}
            disabled={classroomGroups.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر مجموعة" />
            </SelectTrigger>
            <SelectContent>
              {filters.classroomGroupId && (
                <SelectItem value="clear" className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <X className="h-3 w-3" />
                    مسح الاختيار
                  </div>
                </SelectItem>
              )}
              {classroomGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex flex-col">
                    <span>{group.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {group.classroomName}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {classroomGroups.length === 0 && (
                <SelectItem value="disabled" disabled>
                  لا توجد مجموعات متاحة
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-transparent">
            الإجراءات
          </label>
          <Button
            variant="outline"
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
            className="w-full"
          >
            <X className="h-4 w-4 ml-1" />
            مسح جميع الفلاتر
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground mb-2">الفلاتر النشطة:</div>
          <div className="flex flex-wrap gap-2">
            {filters.classroomId && (
              <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                <Building2 className="h-3 w-3" />
                <span>
                  فصل: {classrooms.find(c => c.id === filters.classroomId)?.name || 'غير معروف'}
                </span>
                <button
                  onClick={() => handleClassroomChange('clear')}
                  className="hover:bg-primary/20 ml-1 rounded-sm p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            )}
            {filters.classroomGroupId && (
              <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                <Users className="h-3 w-3" />
                <span>
                  مجموعة: {classroomGroups.find(g => g.id === filters.classroomGroupId)?.name || 'غير معروف'}
                </span>
                <button
                  onClick={() => handleClassroomGroupChange('clear')}
                  className="hover:bg-primary/20 ml-1 rounded-sm p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { orpc } from '@/utils/orpc'
import {
  Button,
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxButton,
  ComboboxCommand,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxLoading,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
} from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Building2, Users, X } from 'lucide-react'
import { useDebouncedSearch } from '@/lib/utils'

interface ClassroomFilterProps {
  selectedClassroomId: string | null
  selectedClassroomGroupId: string | null
  onClassroomChange: (id: string | null) => void
  onClassroomGroupChange: (id: string | null) => void
}

export function ClassroomFilter({
  selectedClassroomId,
  selectedClassroomGroupId,
  onClassroomChange,
  onClassroomGroupChange,
}: ClassroomFilterProps) {
  // Debounced search for classrooms
  const classroomSearch = useDebouncedSearch({})

  // Debounced search for classroom groups
  const classroomGroupSearch = useDebouncedSearch({})

  // Get classrooms list with search
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery(
    orpc.management.classroom.getClassroomsList.queryOptions({
      input: classroomSearch.shouldSearch
        ? { search: classroomSearch.debouncedSearchTerm }
        : undefined,
    })
  )

  // Get classroom groups list with search
  const { data: classroomGroups = [], isLoading: isLoadingClassroomGroups } = useQuery(
    orpc.management.classroom.getClassroomGroupsList.queryOptions({
      input: classroomGroupSearch.shouldSearch
        ? { search: classroomGroupSearch.debouncedSearchTerm }
        : undefined,
    })
  )

  // Type cast to any[] for compatibility
  const typedClassrooms = classrooms as any[]
  const typedClassroomGroups = classroomGroups as any[]

  // Limit initial results to 10 items when no search is active
  const displayedClassrooms = classroomSearch.shouldSearch
    ? typedClassrooms
    : typedClassrooms.slice(0, 10)

  const displayedClassroomGroups = classroomGroupSearch.shouldSearch
    ? typedClassroomGroups
    : typedClassroomGroups.slice(0, 10)

  const handleClassroomChange = (classroomId: string) => {
    if (classroomId === 'clear') {
      onClassroomChange(null)
    } else {
      onClassroomChange(classroomId)
      onClassroomGroupChange(null) // Clear group when classroom is selected
    }
  }

  const handleClassroomGroupChange = (classroomGroupId: string) => {
    if (classroomGroupId === 'clear') {
      onClassroomGroupChange(null)
    } else {
      onClassroomGroupChange(classroomGroupId)
      onClassroomChange(null) // Clear classroom when group is selected
    }
  }

  const clearAllFilters = () => {
    onClassroomChange(null)
    onClassroomGroupChange(null)
  }

  const hasActiveFilters = selectedClassroomId || selectedClassroomGroupId

  // Group classrooms by education level
  const groupedClassrooms = displayedClassrooms.reduce((groups: Record<string, any[]>, classroom: any) => {
    const level = classroom.educationLevel.displayNameAr
    if (!groups[level]) groups[level] = []
    groups[level].push(classroom)
    return groups
  }, {} as Record<string, any[]>)

  // Group classroom groups by classroom
  const groupedClassroomGroups = displayedClassroomGroups.reduce((groups: Record<string, any[]>, group: any) => {
    const classroomName = `${group.classroomName} - ${group.classroomAcademicYear}`
    if (!groups[classroomName]) groups[classroomName] = []
    groups[classroomName].push(group)
    return groups
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Classroom Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            الفصل الدراسي
          </label>
          <Combobox>
            <ComboboxTrigger asChild>
              <ComboboxButton
                placeholder="اختر فصل دراسي"
                clearable={true}
                onClear={() => handleClassroomChange('clear')}
                selectedLabel={
                  selectedClassroomId
                    ? typedClassrooms.find((c: any) => c.id === selectedClassroomId)?.name
                    : undefined
                }
              />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxCommand>
                <ComboboxInput
                  placeholder="البحث في الفصول..."
                  onValueChange={classroomSearch.setSearchTerm}
                />
                <ComboboxList>
                  {isLoadingClassrooms ? (
                    <ComboboxLoading>جاري التحميل...</ComboboxLoading>
                  ) : (
                    <ComboboxEmpty>لا توجد فصول مطابقة</ComboboxEmpty>
                  )}

                  {/* Clear option (ungrouped) */}
                  {selectedClassroomId && (
                    <>
                      <ComboboxGroup>
                        <ComboboxItem
                          onSelect={() => handleClassroomChange('clear')}
                          className="text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                          مسح الاختيار
                        </ComboboxItem>
                      </ComboboxGroup>
                      <ComboboxSeparator />
                    </>
                  )}

                  {/* Grouped by education level */}
                  {Object.entries(groupedClassrooms).map(([level, levelClassrooms]) => (
                    <ComboboxGroup key={level} heading={level}>
                      {levelClassrooms.map((classroom: any) => (
                        <ComboboxItem
                          key={classroom.id}
                          id={classroom.id}
                          searchValue={`${classroom.name} ${classroom.educationLevel.displayNameAr} ${classroom.academicYear}`}
                          selected={selectedClassroomId === classroom.id}
                          onSelect={() => handleClassroomChange(classroom.id)}
                        >
                          <div className="flex flex-col">
                            <span>{classroom.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {classroom.academicYear}
                            </span>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  ))}
                </ComboboxList>
              </ComboboxCommand>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Classroom Group Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            مجموعة الفصل
          </label>
          <Combobox>
            <ComboboxTrigger asChild>
              <ComboboxButton
                placeholder="اختر مجموعة"
                clearable={true}
                onClear={() => handleClassroomGroupChange('clear')}
                selectedLabel={
                  selectedClassroomGroupId
                    ? typedClassroomGroups.find((g: any) => g.id === selectedClassroomGroupId)?.name
                    : undefined
                }
                disabled={typedClassroomGroups.length === 0}
              />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxCommand>
                <ComboboxInput
                  placeholder="البحث في المجموعات..."
                  onValueChange={classroomGroupSearch.setSearchTerm}
                />
                <ComboboxList>
                  {isLoadingClassroomGroups ? (
                    <ComboboxLoading>جاري التحميل...</ComboboxLoading>
                  ) : (
                    <ComboboxEmpty>
                      {typedClassroomGroups.length === 0
                        ? 'لا توجد مجموعات متاحة'
                        : 'لا توجد مجموعات مطابقة'}
                    </ComboboxEmpty>
                  )}

                  {/* Clear option (ungrouped) */}
                  {selectedClassroomGroupId && (
                    <>
                      <ComboboxGroup>
                        <ComboboxItem
                          onSelect={() => handleClassroomGroupChange('clear')}
                          className="text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                          مسح الاختيار
                        </ComboboxItem>
                      </ComboboxGroup>
                      <ComboboxSeparator />
                    </>
                  )}

                  {/* Grouped by classroom */}
                  {Object.entries(groupedClassroomGroups).map(([classroomName, groups]) => (
                    <ComboboxGroup key={classroomName} heading={classroomName}>
                      {groups.map((group: any) => (
                        <ComboboxItem
                          key={group.id}
                          id={group.id}
                          searchValue={`${group.name} ${group.classroomName} ${group.classroomAcademicYear}`}
                          selected={selectedClassroomGroupId === group.id}
                          onSelect={() => handleClassroomGroupChange(group.id)}
                        >
                          {group.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  ))}
                </ComboboxList>
              </ComboboxCommand>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Clear Filters Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-transparent">الإجراءات</label>
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
            {selectedClassroomId && (
              <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                <Building2 className="h-3 w-3" />
                <span>
                  فصل:{' '}
                  {typedClassrooms.find((c: any) => c.id === selectedClassroomId)?.name || 'غير معروف'}
                </span>
                <button
                  onClick={() => handleClassroomChange('clear')}
                  className="hover:bg-primary/20 ml-1 rounded-sm p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            )}
            {selectedClassroomGroupId && (
              <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                <Users className="h-3 w-3" />
                <span>
                  مجموعة:{' '}
                  {typedClassroomGroups.find((g: any) => g.id === selectedClassroomGroupId)?.name ||
                    'غير معروف'}
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

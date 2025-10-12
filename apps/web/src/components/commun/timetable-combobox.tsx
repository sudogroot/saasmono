'use client'

import { orpc } from '@/utils/orpc'
import {
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
import { Building2, Users, Calendar, X } from 'lucide-react'
import { useDebouncedSearch } from '@/lib/utils'
import { useMemo, useState, useEffect } from 'react'

interface TimetableComboboxProps {
  value: string | undefined
  onChange: (timetableId: string | undefined) => void
  placeholder?: string
  disabled?: boolean
}

// Get week boundaries (Monday to Saturday)
function getCurrentWeekBounds() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Calculate Monday of current week
  const monday = new Date(now)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  // Calculate Saturday of current week (6 days after Monday)
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)
  saturday.setHours(23, 59, 59, 999)

  return { startDate: monday, endDate: saturday }
}

export function TimetableCombobox({
  value,
  onChange,
  placeholder = 'اختر جلسة',
  disabled = false,
}: TimetableComboboxProps) {
  // State for classroom and classroom group filters
  const [classroomId, setClassroomId] = useState<string | undefined>(undefined)
  const [classroomGroupId, setClassroomGroupId] = useState<string | undefined>(undefined)

  // Search states
  const classroomSearch = useDebouncedSearch({})
  const classroomGroupSearch = useDebouncedSearch({})
  const timetableSearch = useDebouncedSearch({})

  const [weekBounds, setWeekBounds] = useState<{ startDate: Date; endDate: Date } | null>(null)

  // Calculate week boundaries on client side only
  useEffect(() => {
    setWeekBounds(getCurrentWeekBounds())
  }, [])

  // Get classrooms list with search
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery(
    orpc.management.classroom.getClassroomsList.queryOptions({
      input: classroomSearch.shouldSearch
        ? { search: classroomSearch.debouncedSearchTerm }
        : undefined
    })
  )

  // Get classroom groups list with search
  const { data: classroomGroups = [], isLoading: isLoadingClassroomGroups } = useQuery(
    orpc.management.classroom.getClassroomGroupsList.queryOptions({
      input: classroomGroupSearch.shouldSearch
        ? { search: classroomGroupSearch.debouncedSearchTerm }
        : undefined
    })
  )

  // Limit initial results to 10 items when no search is active
  const displayedClassrooms = classroomSearch.shouldSearch
    ? classrooms
    : classrooms.slice(0, 10)

  const displayedClassroomGroups = classroomGroupSearch.shouldSearch
    ? classroomGroups
    : classroomGroups.slice(0, 10)

  // Group classrooms by education level
  const groupedClassrooms = useMemo(() => {
    return displayedClassrooms.reduce((groups, classroom) => {
      const level = classroom.educationLevel?.displayNameAr || 'غير محدد'
      if (!groups[level]) groups[level] = []
      groups[level].push(classroom)
      return groups
    }, {} as Record<string, typeof displayedClassrooms>)
  }, [displayedClassrooms])

  // Group classroom groups by classroom
  const groupedClassroomGroups = useMemo(() => {
    return displayedClassroomGroups.reduce((groups, group) => {
      const classroomName = `${group.classroomName} - ${group.classroomAcademicYear}`
      if (!groups[classroomName]) groups[classroomName] = []
      groups[classroomName].push(group)
      return groups
    }, {} as Record<string, typeof displayedClassroomGroups>)
  }, [displayedClassroomGroups])

  // Fetch timetables for current week with classroom/group filter
  const hasValidFilter = Boolean(classroomId || classroomGroupId)
  const { data: timetables = [], isLoading: isLoadingTimetables } = useQuery({
    ...orpc.management.timetables.getTimetablesList.queryOptions({
      input: weekBounds && hasValidFilter ? {
        startDate: weekBounds.startDate,
        endDate: weekBounds.endDate,
        classroomId: classroomId,
        classroomGroupId: classroomGroupId,
      } : undefined,
    }),
    enabled: !!weekBounds && hasValidFilter,
  }) as any

  // Filter and sort timetables by search and time (Monday to Saturday, chronological)
  const sortedTimetables = useMemo(() => {
    let filtered = timetables

    // Filter by search if active
    if (timetableSearch.shouldSearch) {
      const searchTerm = timetableSearch.debouncedSearchTerm.toLowerCase()
      filtered = timetables.filter((t: any) =>
        t.title.toLowerCase().includes(searchTerm) ||
        t.educationSubject?.displayNameAr?.toLowerCase().includes(searchTerm) ||
        t.teacher?.name?.toLowerCase().includes(searchTerm) ||
        t.teacher?.lastName?.toLowerCase().includes(searchTerm)
      )
    }

    // Sort by day of week (Monday=1 to Saturday=6) then by time
    return filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.startDateTime)
      const dateB = new Date(b.startDateTime)

      // Get day of week (convert Sunday=0 to 7 for easier sorting)
      const dayA = dateA.getDay() === 0 ? 7 : dateA.getDay()
      const dayB = dateB.getDay() === 0 ? 7 : dateB.getDay()

      // First sort by day
      if (dayA !== dayB) {
        return dayA - dayB
      }

      // Then by time
      return dateA.getTime() - dateB.getTime()
    })
  }, [timetables, timetableSearch.shouldSearch, timetableSearch.debouncedSearchTerm])

  // Handle classroom selection
  const handleClassroomChange = (newClassroomId: string) => {
    if (newClassroomId === 'clear') {
      setClassroomId(undefined)
    } else {
      setClassroomId(newClassroomId)
      setClassroomGroupId(undefined) // Clear group when classroom is selected
      onChange(undefined) // Clear timetable selection
    }
  }

  // Handle classroom group selection
  const handleClassroomGroupChange = (newClassroomGroupId: string) => {
    if (newClassroomGroupId === 'clear') {
      setClassroomGroupId(undefined)
    } else {
      setClassroomGroupId(newClassroomGroupId)
      setClassroomId(undefined) // Clear classroom when group is selected
      onChange(undefined) // Clear timetable selection
    }
  }

  // Handle timetable selection
  const handleTimetableSelect = (timetableId: string) => {
    if (timetableId === 'clear') {
      onChange(undefined)
    } else {
      onChange(timetableId)
    }
  }

  const selectedTimetable = timetables.find((t: any) => t.id === value)
  const selectedLabel = selectedTimetable
    ? `${selectedTimetable.title} - ${new Date(selectedTimetable.startDateTime).toLocaleDateString('ar-SA')}`
    : undefined

  const selectedClassroom = classrooms.find(c => c.id === classroomId)
  const selectedClassroomGroup = classroomGroups.find(g => g.id === classroomGroupId)

  // Format day name in Arabic
  const getDayName = (date: Date) => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    return days[date.getDay()]
  }

  return (
    <div className="space-y-3">
      {/* Classroom Dropdown */}
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
              selectedLabel={selectedClassroom?.name}
              disabled={disabled}
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

                {/* Clear option */}
                {classroomId && (
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
                    {levelClassrooms.map((classroom) => (
                      <ComboboxItem
                        key={classroom.id}
                        id={classroom.id}
                        searchValue={`${classroom.name} ${classroom.educationLevel?.displayNameAr || ''} ${classroom.academicYear}`}
                        selected={classroomId === classroom.id}
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

      {/* Classroom Group Dropdown */}
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
              selectedLabel={selectedClassroomGroup?.name}
              disabled={disabled || classroomGroups.length === 0}
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
                    {classroomGroups.length === 0 ? "لا توجد مجموعات متاحة" : "لا توجد مجموعات مطابقة"}
                  </ComboboxEmpty>
                )}

                {/* Clear option */}
                {classroomGroupId && (
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
                    {groups.map((group) => (
                      <ComboboxItem
                        key={group.id}
                        id={group.id}
                        searchValue={`${group.name} ${group.classroomName} ${group.classroomAcademicYear}`}
                        selected={classroomGroupId === group.id}
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

      {/* Timetable Dropdown - Only enabled when classroom or group is selected */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          الجلسة
        </label>
        <Combobox>
          <ComboboxTrigger asChild>
            <ComboboxButton
              placeholder={hasValidFilter ? placeholder : "اختر فصل أو مجموعة أولاً"}
              clearable={true}
              onClear={() => handleTimetableSelect('clear')}
              selectedLabel={selectedLabel}
              disabled={disabled || !hasValidFilter}
            />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxCommand>
              <ComboboxInput
                placeholder="البحث في الجلسات..."
                onValueChange={timetableSearch.setSearchTerm}
              />
              <ComboboxList>
                {isLoadingTimetables ? (
                  <ComboboxLoading>جاري التحميل...</ComboboxLoading>
                ) : (
                  <ComboboxEmpty>
                    {sortedTimetables.length === 0
                      ? 'لا توجد جلسات في الأسبوع الحالي'
                      : 'لا توجد جلسات مطابقة'}
                  </ComboboxEmpty>
                )}

                {/* Clear option */}
                {value && (
                  <>
                    <ComboboxGroup>
                      <ComboboxItem
                        onSelect={() => handleTimetableSelect('clear')}
                        className="text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                        مسح الاختيار
                      </ComboboxItem>
                    </ComboboxGroup>
                    <ComboboxSeparator />
                  </>
                )}

                {/* Flat list sorted by time */}
                <ComboboxGroup>
                  {sortedTimetables.map((timetable: any) => {
                    const startDate = new Date(timetable.startDateTime)
                    const dayName = getDayName(startDate)

                    return (
                      <ComboboxItem
                        key={timetable.id}
                        id={timetable.id}
                        searchValue={`${timetable.title} ${timetable.educationSubject?.displayNameAr || ''} ${timetable.teacher?.name || ''} ${timetable.teacher?.lastName || ''}`}
                        selected={value === timetable.id}
                        onSelect={() => handleTimetableSelect(timetable.id)}
                      >
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {timetable.educationSubject?.displayNameAr || timetable.title}
                            </span>
                            <span className="text-xs text-muted-foreground">{dayName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {startDate.toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {startDate.toLocaleDateString('ar-SA', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          {timetable.teacher && (
                            <div className="text-xs text-muted-foreground">
                              {timetable.teacher.name} {timetable.teacher.lastName}
                            </div>
                          )}
                        </div>
                      </ComboboxItem>
                    )
                  })}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxCommand>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}

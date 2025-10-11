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
} from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Calendar, X } from 'lucide-react'
import { useDebouncedSearch } from '@/lib/utils'
import { useMemo, useState, useEffect } from 'react'

interface TimetableComboboxProps {
  value: string | undefined
  onChange: (timetableId: string | undefined) => void
  placeholder?: string
  disabled?: boolean
}

// Get ISO week boundaries (Monday to Sunday)
function getCurrentWeekBounds() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Calculate Monday of current week
  const monday = new Date(now)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  // Calculate Sunday of current week
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { startDate: monday, endDate: sunday }
}

export function TimetableCombobox({
  value,
  onChange,
  placeholder = 'اختر جلسة',
  disabled = false,
}: TimetableComboboxProps) {
  const search = useDebouncedSearch({})
  const [weekBounds, setWeekBounds] = useState<{ startDate: Date; endDate: Date } | null>(null)

  // Calculate week boundaries on client side only
  useEffect(() => {
    setWeekBounds(getCurrentWeekBounds())
  }, [])

  // Fetch timetables for current week
  const { data: timetables = [], isLoading } = useQuery({
    ...orpc.management.timetables.getTimetablesList.queryOptions({
      input: weekBounds ? {
        startDate: weekBounds.startDate,
        endDate: weekBounds.endDate,
      } : undefined,
    }),
    enabled: !!weekBounds,
  }) as any

  // Filter by search if active
  const filteredTimetables = useMemo(() => {
    if (!search.shouldSearch) {
      return timetables.slice(0, 20) // Limit to 20 items initially
    }

    const searchTerm = search.debouncedSearchTerm.toLowerCase()
    return timetables.filter((t) =>
      t.title.toLowerCase().includes(searchTerm) ||
      t.classroom?.name?.toLowerCase().includes(searchTerm) ||
      t.classroomGroup?.name?.toLowerCase().includes(searchTerm) ||
      t.teacher?.fullName?.toLowerCase().includes(searchTerm)
    )
  }, [timetables, search.shouldSearch, search.debouncedSearchTerm])

  // Group timetables by classroom and classroom group
  const groupedTimetables = useMemo(() => {
    const groups: Record<string, typeof filteredTimetables> = {}

    for (const timetable of filteredTimetables) {
      let groupKey: string

      if (timetable.classroom) {
        groupKey = `classroom_${timetable.classroom.name} - ${timetable.classroom.academicYear}`
      } else if (timetable.classroomGroup) {
        groupKey = `group_${timetable.classroomGroup.name} - ${timetable.classroomGroup.classroomName}`
      } else {
        groupKey = 'other_أخرى'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(timetable)
    }

    return groups
  }, [filteredTimetables])

  const handleSelect = (timetableId: string) => {
    if (timetableId === 'clear') {
      onChange(undefined)
    } else {
      onChange(timetableId)
    }
  }

  const selectedTimetable = timetables.find((t) => t.id === value)
  const selectedLabel = selectedTimetable
    ? `${selectedTimetable.title} - ${new Date(selectedTimetable.startDateTime).toLocaleDateString('ar-SA')}`
    : undefined

  return (
    <Combobox>
      <ComboboxTrigger asChild>
        <ComboboxButton
          placeholder={placeholder}
          clearable={true}
          onClear={() => handleSelect('clear')}
          selectedLabel={selectedLabel}
          disabled={disabled}
        />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxCommand>
          <ComboboxInput
            placeholder="البحث في الجلسات..."
            onValueChange={search.setSearchTerm}
          />
          <ComboboxList>
            {isLoading ? (
              <ComboboxLoading>جاري التحميل...</ComboboxLoading>
            ) : (
              <ComboboxEmpty>
                {timetables.length === 0
                  ? 'لا توجد جلسات في الأسبوع الحالي'
                  : 'لا توجد جلسات مطابقة'}
              </ComboboxEmpty>
            )}

            {/* Clear option */}
            {value && (
              <>
                <ComboboxGroup>
                  <ComboboxItem
                    onSelect={() => handleSelect('clear')}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    مسح الاختيار
                  </ComboboxItem>
                </ComboboxGroup>
              </>
            )}

            {/* Grouped timetables */}
            {Object.entries(groupedTimetables).map(([groupKey, groupTimetables]) => {
              const groupLabel = groupKey.split('_')[1]

              return (
                <ComboboxGroup key={groupKey} heading={groupLabel}>
                  {groupTimetables.map((timetable) => (
                    <ComboboxItem
                      key={timetable.id}
                      value={`${timetable.title} ${timetable.teacher?.fullName || ''} ${timetable.classroom?.name || ''} ${timetable.classroomGroup?.name || ''}`}
                      selected={value === timetable.id}
                      onSelect={() => handleSelect(timetable.id)}
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{timetable.title}</span>
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(timetable.startDateTime).toLocaleDateString('ar-SA')} -{' '}
                          {new Date(timetable.startDateTime).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {timetable.teacher && (
                          <div className="text-xs text-muted-foreground">
                            المعلم: {timetable.teacher.fullName}
                          </div>
                        )}
                      </div>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              )
            })}
          </ComboboxList>
        </ComboboxCommand>
      </ComboboxContent>
    </Combobox>
  )
}

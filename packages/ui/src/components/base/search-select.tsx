"use client"

import * as React from "react"
import { Button } from "../ui/button"
import {
  Combobox,
  ComboboxButton,
  ComboboxCommand,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../ui/combobox"
import { Plus } from "lucide-react"

export interface SearchSelectOption {
  id: string
  label: string
  searchLabel?: string
  metadata?: string
  disabled?: boolean
}

export interface SearchSelectGroup {
  groupLabel: string
  options: SearchSelectOption[]
}

export interface SearchSelectProps {
  // Core data
  options?: SearchSelectOption[]
  groups?: SearchSelectGroup[]
  value?: string
  onValueChange?: (value: string) => void

  // Display
  placeholder?: string
  emptyMessage?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean

  // Loading
  isLoading?: boolean
  loadingMessage?: string

  // Create new entity
  allowCreate?: boolean
  createLabel?: string
  onCreateClick?: (searchValue: string) => void

  // Search
  searchable?: boolean
  onSearchChange?: (search: string) => void

  // Optional "none" option
  allowNone?: boolean
  noneLabel?: string
}

export function SearchSelect({
  options = [],
  groups = [],
  value,
  onValueChange,
  placeholder = "اختر...",
  emptyMessage = "لا توجد نتائج",
  searchPlaceholder = "بحث...",
  className,
  disabled = false,
  clearable = false,
  isLoading = false,
  loadingMessage = "جاري التحميل...",
  allowCreate = false,
  createLabel = "إضافة جديد",
  onCreateClick,
  searchable = true,
  onSearchChange,
  allowNone = false,
  noneLabel = "بدون",
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Get selected option label
  const getSelectedLabel = () => {
    if (!value) return null

    if (value === "none") return noneLabel

    // Check in flat options
    const flatOption = options.find((opt) => opt.id === value)
    if (flatOption) return flatOption.label

    // Check in grouped options
    for (const group of groups) {
      const groupOption = group.options.find((opt) => opt.id === value)
      if (groupOption) return groupOption.label
    }

    return null
  }

  const selectedLabel = getSelectedLabel()

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue === value ? "" : selectedValue)
    setOpen(false)
  }

  const handleClear = () => {
    onValueChange?.("")
  }

  const handleSearchChange = (search: string) => {
    setSearchValue(search)
    onSearchChange?.(search)
  }

  // Filter options based on search
  const filterOptions = (opts: SearchSelectOption[]) => {
    if (!searchValue) return opts
    const searchLower = searchValue.toLowerCase()
    return opts.filter((opt) => {
      const searchIn = opt.searchLabel || opt.label
      return searchIn.toLowerCase().includes(searchLower)
    })
  }

  const filteredOptions = filterOptions(options)
  const filteredGroups = groups.map((group) => ({
    ...group,
    options: filterOptions(group.options),
  })).filter((group) => group.options.length > 0)

  const hasResults = filteredOptions.length > 0 || filteredGroups.length > 0
  const showCreateButton = allowCreate && onCreateClick && searchValue && !hasResults

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger asChild>
        <ComboboxButton
          className={className}
          placeholder={placeholder}
          selectedLabel={selectedLabel}
          clearable={clearable && !!value}
          onClear={handleClear}
          disabled={disabled}
        />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxCommand shouldFilter={false}>
          {searchable && (
            <ComboboxInput
              placeholder={searchPlaceholder}
              onValueChange={handleSearchChange}
            />
          )}
          <ComboboxList>
            {isLoading ? (
              <ComboboxEmpty>{loadingMessage}</ComboboxEmpty>
            ) : (
              <>
                {/* None option */}
                {allowNone && (
                  <ComboboxItem
                    selected={value === "none"}
                    onSelect={() => handleSelect("none")}
                  >
                    {noneLabel}
                  </ComboboxItem>
                )}

                {/* Flat options */}
                {filteredOptions.map((option) => (
                  <ComboboxItem
                    key={option.id}
                    selected={value === option.id}
                    onSelect={() => handleSelect(option.id)}
                    disabled={option.disabled}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.metadata && (
                        <span className="text-muted-foreground text-xs">
                          {option.metadata}
                        </span>
                      )}
                    </div>
                  </ComboboxItem>
                ))}

                {/* Grouped options */}
                {filteredGroups.map((group) => (
                  <ComboboxGroup key={group.groupLabel} heading={group.groupLabel}>
                    {group.options.map((option) => (
                      <ComboboxItem
                        key={option.id}
                        selected={value === option.id}
                        onSelect={() => handleSelect(option.id)}
                        disabled={option.disabled}
                      >
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.metadata && (
                            <span className="text-muted-foreground text-xs">
                              {option.metadata}
                            </span>
                          )}
                        </div>
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                ))}

                {/* Empty state with create button */}
                {!hasResults && !isLoading && (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground text-sm mb-3">
                      {emptyMessage}
                    </p>
                    {showCreateButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpen(false)
                          onCreateClick?.(searchValue)
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {createLabel}
                      </Button>
                    )}
                  </div>
                )}

                {/* No results but has items */}
                {!hasResults && !isLoading && (options.length > 0 || groups.length > 0) && !showCreateButton && (
                  <ComboboxEmpty>
                    {emptyMessage}
                  </ComboboxEmpty>
                )}
              </>
            )}
          </ComboboxList>
        </ComboboxCommand>
      </ComboboxContent>
    </Combobox>
  )
}

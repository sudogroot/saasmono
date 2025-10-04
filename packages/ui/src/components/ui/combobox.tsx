"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { cn } from "../../lib/utils"

function Combobox({
  ...props
}: React.ComponentProps<typeof Popover>) {
  return <Popover data-slot="combobox" {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  return (
    <PopoverTrigger data-slot="combobox-trigger" className={className} {...props}>
      {children}
    </PopoverTrigger>
  )
}

function ComboboxContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="combobox-content"
      align={align}
      sideOffset={sideOffset}
      className={cn("w-full min-w-[var(--radix-popover-trigger-width)] p-0", className)}
      {...props}
    />
  )
}

function ComboboxButton({
  className,
  placeholder = "Select an option...",
  clearable = false,
  onClear,
  selectedLabel,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  placeholder?: string
  clearable?: boolean
  onClear?: () => void
  selectedLabel?: string | React.ReactNode
}) {
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClear?.()
  }

  return (
    <Button
      variant="outline"
      role="combobox"
      data-slot="combobox-button"
      className={cn(
        "w-full justify-between font-normal",
        !selectedLabel && "text-muted-foreground",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-left truncate">
        {selectedLabel || placeholder}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {clearable && selectedLabel && (
          <X
            className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={handleClear}
          />
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </div>
    </Button>
  )
}

function ComboboxCommand({
  ...props
}: React.ComponentProps<typeof Command>) {
  return <Command data-slot="combobox-command" {...props} />
}

function ComboboxInput({
  className,
  onValueChange,
  ...props
}: React.ComponentProps<typeof CommandInput> & {
  onValueChange?: (value: string) => void
}) {
  return (
    <CommandInput
      data-slot="combobox-input"
      className={cn("h-9", className)}
      onValueChange={onValueChange}
      {...props}
    />
  )
}

function ComboboxList({
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return <CommandList data-slot="combobox-list" {...props} />
}

function ComboboxEmpty({
  children = "No results found.",
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return (
    <CommandEmpty data-slot="combobox-empty" {...props}>
      {children}
    </CommandEmpty>
  )
}

function ComboboxLoading({
  children = "Loading...",
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return (
    <CommandEmpty data-slot="combobox-loading" {...props}>
      {children}
    </CommandEmpty>
  )
}

function ComboboxGroup({
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="combobox-group" {...props} />
}

function ComboboxItem({
  className,
  children,
  selected = false,
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  selected?: boolean
}) {
  return (
    <CommandItem
      data-slot="combobox-item"
      className={cn("cursor-pointer", className)}
      onSelect={onSelect}
      {...props}
    >
      <div className="flex items-center w-full">
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            selected ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </CommandItem>
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="combobox-separator"
      className={cn("border-b mx-2", className)}
      {...props}
    />
  )
}

export {
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
}

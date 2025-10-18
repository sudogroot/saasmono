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
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "./drawer"
import { cn } from "../../lib/utils"
import { useMediaQuery } from "../../hooks/use-media-query"

// Context for sharing state between Combobox components
const ComboboxContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  isDesktop: boolean
} | null>(null)

function useComboboxContext() {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error("Combobox components must be used within a Combobox")
  }
  return context
}

function Combobox({
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <ComboboxContext.Provider value={{ open, setOpen, isDesktop }}>
      {isDesktop ? (
        <Popover data-slot="combobox" open={open} onOpenChange={setOpen} modal={true} {...props}>
          {children}
        </Popover>
      ) : (
        <Drawer data-slot="combobox" direction="bottom" open={open} onOpenChange={setOpen} {...props}>
          {children}
        </Drawer>
      )}
    </ComboboxContext.Provider>
  )
}

function ComboboxTrigger({
  className,
  children,
  asChild,
  ...props
}: {
  className?: string
  children: React.ReactNode
  asChild?: boolean
}) {
  const { isDesktop } = useComboboxContext()

  const TriggerComponent = isDesktop ? PopoverTrigger : DrawerTrigger

  return (
    <TriggerComponent
      data-slot="combobox-trigger"
      className={className}
      asChild={asChild}
      {...props}
    >
      {children}
    </TriggerComponent>
  )
}

function ComboboxContent({
  className,
  align = "start",
  sideOffset = 4,
  children,
  ...props
}: {
  className?: string
  align?: "start" | "center" | "end"
  sideOffset?: number
  children: React.ReactNode
}) {
  const { isDesktop } = useComboboxContext()

  if (isDesktop) {
    return (
      <PopoverContent
        data-slot="combobox-content"
        align={align}
        sideOffset={sideOffset}
        className={cn("w-full min-w-[var(--radix-popover-trigger-width)] p-0", className)}
        {...props}
      >
        {children}
      </PopoverContent>
    )
  }

  return (
    <DrawerContent
      data-slot="combobox-content"
      className={cn("p-0", className)}
      {...props}
    >
      <div className="mt-4 border-t">
        {children}
      </div>
    </DrawerContent>
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
      <div className="flex-1 text-start truncate">
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
  id,
  searchValue,
  value,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, 'value'> & {
  selected?: boolean
  id?: string
  searchValue?: string
  value?: string
}) {
  const { setOpen } = useComboboxContext()

  // Use id as primary value for unique identification, fallback to value for backward compatibility
  const itemValue = id || value

  // If searchValue is provided, use it for keywords; otherwise use the value
  const keywords = searchValue ? [searchValue] : undefined

  const handleSelect = (value: string) => {
    onSelect?.(value)
    // Add a small delay for smooth closing animation
    setTimeout(() => setOpen(false), 150)
  }

  return (
    <CommandItem
      data-slot="combobox-item"
      className={cn("cursor-pointer", className)}
      onSelect={handleSelect}
      value={itemValue}
      keywords={keywords}
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

"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType>({})

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        open,
        onOpenChange: setOpen,
      }}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        {children}
      </DropdownMenu>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuTrigger asChild>
    <Button
      ref={ref}
      variant="outline"
      role="combobox"
      className={cn(
        "w-full justify-between bg-white",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </DropdownMenuTrigger>
))
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)
  return (
    <span className={cn(!value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  )
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

const SelectContent = ({ children, className }: SelectContentProps) => (
  <DropdownMenuContent className={cn("w-[200px] p-0", className)}>
    {children}
  </DropdownMenuContent>
)

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const { value: selectedValue, onValueChange, onOpenChange } = React.useContext(SelectContext)
  
  const handleSelect = () => {
    onValueChange?.(value)
    onOpenChange?.(false)
  }

  return (
    <DropdownMenuItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onSelect={handleSelect}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {selectedValue === value && <Check className="h-4 w-4" />}
      </span>
      {children}
    </DropdownMenuItem>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

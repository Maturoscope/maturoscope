"use client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Settings, LogOut, ChevronDown } from "lucide-react"
  import { useState } from "react"
  
  export function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-2 max-h-12 min-w-[200px]">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/logo.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="font-medium text-sm ">Placeholder</span>
            <span className="text-muted-foreground text-xs">
              Novatek
            </span>
          </div>
          <ChevronDown 
            className={`ml-auto h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </DropdownMenuTrigger>
  
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
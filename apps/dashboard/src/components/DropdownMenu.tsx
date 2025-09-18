"use client"

import React, { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Settings, LogOut, ChevronDown } from "lucide-react"
  import { useUserContext } from "@/app/hooks/contexts/UserProvider"
  import { useRouter } from "next/navigation"
  import { useTranslation } from "react-i18next"
  import Link from "next/link"
  
  export function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, loading } = useUserContext()
    const { t } = useTranslation("DASHBOARD")
    const router = useRouter()
    
    const handleLogout = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        })
        
        if (response.ok) {
          router.push('/login')
        } else {
          console.error('Logout failed')
        }
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }
    
    if (loading) {
      return (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 max-h-12 min-w-[200px] animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="flex flex-col gap-1">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="ml-auto h-4 w-4 bg-gray-200 rounded"></div>
        </div>
      )
    }
    
    return (
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-2 max-h-12 min-w-[200px]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.picture || "/logo.png"} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="font-medium text-sm">
              {user?.name || "Usuario"}
            </span>
            <span className="text-muted-foreground text-xs">
              {user?.organization?.name || "Organización"}
            </span>
          </div>
          <ChevronDown 
            className={`ml-auto h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </DropdownMenuTrigger>
  
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuItem className="flex items-center gap-2" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              {t('SETTINGS')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {t('LOG_OUT')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
"use client"

import React, { useEffect, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Settings, LogOut, ChevronDown, Check, Building2 } from "lucide-react"
  import { useUserContext } from "@/app/hooks/contexts/UserProvider"
  import { useRouter } from "next/navigation"
  import { useTranslation } from "react-i18next"
  import Link from "next/link"
  import { useImageVersion } from "@/hooks/useImageVersion"
  import { IMAGE_VERSION_CONSTANTS, UI_CONSTANTS } from "@/constants/imageVersion"
  import { UserAvatarData } from "@/types/image"

  interface OrgOption {
    id: string
    name: string
    avatar?: string | null
    isDefault: boolean
  }

  const getAvatarSrc = (user: UserAvatarData | null, getVersionedUrl: (url: string | null | undefined) => string): string => {
    if (user?.picture) return getVersionedUrl(user.picture);
    if (user?.organization?.avatar) return getVersionedUrl(user.organization.avatar);
    return IMAGE_VERSION_CONSTANTS.FALLBACK_IMAGES.LOGO;
  };

  const getAvatarFallback = (user: UserAvatarData | null): string => {
    return user?.firstName?.charAt(0)?.toUpperCase() || 
           user?.name?.charAt(0)?.toUpperCase() || 
           IMAGE_VERSION_CONSTANTS.FALLBACK_IMAGES.USER_PLACEHOLDER;
  };

  const getUserDisplayName = (user: UserAvatarData | null): string => {
    return user?.name || "Usuario";
  };

  const getOrganizationName = (user: UserAvatarData | null): string => {
    return user?.organization?.name || "Organización";
  };
  
  export function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [orgs, setOrgs] = useState<OrgOption[]>([])
    const [switching, setSwitching] = useState(false)
    const { user, loading } = useUserContext()
    const { t } = useTranslation("DASHBOARD")
    const router = useRouter()

    const pendingCount = user?.pendingInvitationsCount ?? 0
    const activeOrgId = user?.activeOrganizationId || user?.organization?.id

    const { getVersionedUrl } = useImageVersion({
      storageKey: IMAGE_VERSION_CONSTANTS.STORAGE_KEYS.AVATAR,
      eventName: IMAGE_VERSION_CONSTANTS.EVENTS.AVATAR_UPDATED
    })

    // Load the user's active organizations for the switcher when opened.
    useEffect(() => {
      if (!isOpen || orgs.length > 0) return
      fetch('/api/organizations/memberships', { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data?.active && setOrgs(data.active))
        .catch(() => {})
    }, [isOpen, orgs.length])

    const handleSwitchOrg = async (orgId: string) => {
      if (orgId === activeOrgId || switching) return
      setSwitching(true)
      try {
        const res = await fetch('/api/organizations/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ organizationId: orgId }),
        })
        if (res.ok) {
          // Full reload so every org-scoped view reflects the new active org.
          window.location.assign('/dashboard/overview')
        } else {
          setSwitching(false)
        }
      } catch {
        setSwitching(false)
      }
    }

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
        <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-md border px-3 py-2 max-h-12 min-w-[200px]">
          <div className="relative">
            <Avatar className={UI_CONSTANTS.AVATAR_SIZE}>
              <AvatarImage src={getAvatarSrc(user, getVersionedUrl)} />
              <AvatarFallback>{getAvatarFallback(user)}</AvatarFallback>
            </Avatar>
            {pendingCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                aria-label={`${pendingCount} ${t('ORG_SWITCHER.INVITATIONS')}`}
              />
            )}
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-medium text-sm">
              {getUserDisplayName(user)}
            </span>
            <span className="text-muted-foreground text-xs">
              {getOrganizationName(user)}
            </span>
          </div>
          <ChevronDown
            className={`ml-auto h-4 w-4 transition-transform duration-${UI_CONSTANTS.ANIMATION_DURATION} ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent className={UI_CONSTANTS.DROPDOWN_WIDTH}>
          {orgs.length > 1 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t('ORG_SWITCHER.TITLE')}
              </DropdownMenuLabel>
              {orgs.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="flex items-center gap-2 cursor-pointer"
                  disabled={switching}
                  onClick={() => handleSwitchOrg(org.id)}
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrgId && (
                    <Check className="ml-auto h-4 w-4 text-gray-900" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem className="flex items-center gap-2" asChild>
            <Link href="/dashboard/settingsUser?section=organizations">
              <Building2 className="h-4 w-4" />
              <span>{t('ORG_SWITCHER.MANAGE')}</span>
              {pendingCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" asChild>
            <Link href="/dashboard/settingsUser">
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
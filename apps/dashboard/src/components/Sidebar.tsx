"use client"

import type * as React from "react"
import { ChevronDown, LayoutDashboard, Users, Settings, File, SquareUser, LineChart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import logo from "./../../public/icons/logo.svg"
import { useUserContext } from "@/app/hooks/contexts/UserProvider"
import { User } from "@/app/hooks/useUser"
import { useTranslation } from "react-i18next"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const generateNavData = (user: User | null, t: (key: string) => string) => {
  const sections = [];
  const userRoles = user?.roles || [];
  
  const hasUserAccess = userRoles.includes('user') || userRoles.includes('admin') || userRoles.length === 0;
  
  if (hasUserAccess) {
    sections.push({
      title: user?.organization?.name || "Organization",
      items: [
        {
          title: t('DASHBOARD'),
          url: "/dashboard/overview",
          icon: LayoutDashboard,
        },
        {
          title: t('SERVICES'),
          url: "/dashboard/services",
          icon: File,
        },
        {
          title: t('MEMBERS'),
          url: "/dashboard/members",
          icon: Users,
        },
        {
          title: t('SETTINGS'),
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    });
  }
  
  const hasAdminAccess = userRoles.includes('admin');
  
  if (hasAdminAccess) {
    sections.push({
      title: t('SUPER_ADMIN'),
      items: [
        {
          title: t('REPORTS'),
          url: "/dashboard/reports",
          icon: SquareUser,
        },
        {
          title: t('ORGANIZATIONS'),
          url: "/dashboard/organizations",
          icon: LineChart,
        },
      ],
    });
  }

  return { navMain: sections };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, loading } = useUserContext()
  const { t } = useTranslation("DASHBOARD")
  
  const navData = generateNavData(user, t)
  
  if (loading) {
    return (
      <Sidebar {...props} className="w-[var(--sidebar-width)]">
        <SidebarHeader className="border-b border-sidebar-border h-16 flex justify-center px-4">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="Logo" width={32} height={32} />
            <div>
              <h2 className="font-semibold text-sidebar-foreground text-sm">Maturoscope</h2>
              <p className="text-xs text-muted-foreground">v1.01</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }
  
  return (
    <Sidebar {...props} className="w-[var(--sidebar-width)]">
      <SidebarHeader className="border-b border-sidebar-border h-16 flex justify-center px-4">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="Logo" width={32} height={32} />
          <div>
            <h2 className="font-semibold text-sidebar-foreground text-sm">Maturoscope</h2>
            <p className="text-xs text-muted-foreground">v1.01</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navData.navMain.map((section) => (
          <Collapsible key={section.title} title={section.title} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm font-medium px-3 py-2"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  {section.title}
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const isActive = pathname === item.url
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive} className="px-6">
                            <Link href={item.url} className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              {item.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

"use client"

import type * as React from "react"
import { ChevronDown, LayoutDashboard, Users, Settings, File, SquareUser, Server, LineChart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import logo from "./../../public/icons/logo.svg"

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

const data = {
  navMain: [
    {
      title: "Nobatek",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/overview",
          icon: LayoutDashboard,
        },
        {
          title: "Services",
          url: "/dashboard/services",
          icon: File,
        },
        {
          title: "Members",
          url: "/dashboard/members",
          icon: Users,
        },
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Super-Admin",
      items: [
        {
          title: "Reports",
          url: "/dashboard/reports",
          icon: SquareUser,
        },
        {
          title: "Organizations",
          url: "/dashboard/organizations",
          icon: LineChart,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
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
        {data.navMain.map((section) => (
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
                      const isActive = pathname === item.url || pathname.startsWith(item.url)
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

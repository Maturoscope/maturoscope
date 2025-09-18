import type React from "react"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserProvider } from "@/app/hooks/contexts/UserProvider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem as BreadcrumbItemComponent,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Separator } from "@/components/ui/separator"
  import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserDropdown } from "./DropdownMenu"
  
  interface PageHeaderProps {
    breadcrumbs: { label: string; href?: string }[]
  }
  
  export function PageHeader({ breadcrumbs }: PageHeaderProps) {
    return (
      <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 z-10 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-[1px]"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItemComponent>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItemComponent>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <UserDropdown />
      </header>
    )
  }
  
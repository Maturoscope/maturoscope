import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActiveFilter, RegistrationFilter } from "../types/member";
import { RegistrationTabs } from "./RegistrationTabs";
import { NewMemberSheet } from "./NewMemberSheet";

interface MembersHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  registrationFilter: RegistrationFilter;
  onRegistrationFilterChange: (filter: RegistrationFilter) => void;
  activeFilter: ActiveFilter;
  onActiveFilterChange: (filter: ActiveFilter) => void;
  activeCounts: { active: number; inactive: number };
  organizationId: string;
  onMemberCreated: () => void;
}

export function MembersHeader({
  searchQuery,
  onSearchChange,
  registrationFilter,
  onRegistrationFilterChange,
  activeFilter,
  onActiveFilterChange,
  activeCounts,
  organizationId,
  onMemberCreated,
}: MembersHeaderProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <RegistrationTabs
        selectedFilter={registrationFilter}
        onFilterChange={onRegistrationFilterChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border-slate-200 px-4"
          >
            {activeFilter === "inactive"
              ? `Inactive (${activeCounts.inactive})`
              : `Active (${activeCounts.active})`}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => onActiveFilterChange("active")}
            className="cursor-pointer text-[#0A0A0A]"
          >
            Active
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onActiveFilterChange("inactive")}
            className="cursor-pointer text-[#0A0A0A]"
          >
            Inactive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex w-full items-center gap-2 text-sm md:w-[500px]">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A0A0A]/40" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by first name, last name or email"
            className="h-9 rounded-[8px] border-slate-200 pl-10"
          />
        </div>
        <NewMemberSheet
          organizationId={organizationId}
          onSuccess={onMemberCreated}
        />
      </div>
    </div>
  );
}


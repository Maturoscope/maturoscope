"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Search, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScaleType } from "../types/service";
import { ScaleTabs } from "./ScaleTabs";

interface ServicesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  scaleFilter: ScaleType | "All";
  onScaleFilterChange: (filter: ScaleType | "All") => void;
  onAddService: () => void;
}

export function ServicesHeader({
  searchQuery,
  onSearchChange,
  scaleFilter,
  onScaleFilterChange,
  onAddService,
}: ServicesHeaderProps) {
  const { t } = useTranslation("SERVICES");

  // Dropdown options for scale
  const SCALE_OPTIONS: Array<{ value: ScaleType; label: string }> = [
    { value: "TRL", label: "TRL" },
    { value: "MkRL", label: "MkRL" },
    { value: "MfRL", label: "MfRL" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {/* Scale Tabs */}
      <ScaleTabs
        selectedFilter={scaleFilter}
        onFilterChange={onScaleFilterChange}
      />

      {/* Scale Dropdown (optional filter) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border-slate-200 px-4"
          >
            {t("FILTERS.SCALE")}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => onScaleFilterChange("All")}
            className="cursor-pointer text-[#0A0A0A]"
          >
            {t("FILTERS.ALL")}
          </DropdownMenuItem>
          {SCALE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onScaleFilterChange(option.value)}
              className="cursor-pointer text-[#0A0A0A]"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search and Add Service */}
      <div className="ml-auto flex w-full items-center gap-2 text-sm md:w-[500px]">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A0A0A]/40" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("SEARCH.PLACEHOLDER")}
            className="h-9 rounded-[8px] border-slate-200 pl-10"
          />
        </div>
        <Button
          onClick={onAddService}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t("ADD_SERVICE_BUTTON")}
        </Button>
      </div>
    </div>
  );
}


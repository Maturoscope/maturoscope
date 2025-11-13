import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RegistrationFilter,
  registrationStatusLabels,
} from "../types/member";

interface RegistrationTabsProps {
  selectedFilter: RegistrationFilter;
  onFilterChange: (filter: RegistrationFilter) => void;
}

const filters: RegistrationFilter[] = ["all", "completed", "pending", "expired"];

export function RegistrationTabs({
  selectedFilter,
  onFilterChange,
}: RegistrationTabsProps) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-[10px] bg-[#F5F5F5] px-1">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
          className={cn(
            "relative h-7 min-w-[80px] rounded-[8px] px-2 text-sm font-medium transition-colors",
            selectedFilter === filter
              ? "text-[#0A0A0A]"
              : "text-[#0A0A0A]/60"
          )}
        >
          {selectedFilter === filter && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-[8px] bg-white shadow-sm"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-10">
            {filter === "all" ? "All" : registrationStatusLabels[filter]}
          </span>
        </button>
      ))}
    </div>
  );
}


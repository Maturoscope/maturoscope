import { useState, useMemo } from "react";
import {
  Member,
  ActiveFilter,
  RegistrationFilter,
} from "../types/member";

export function useFilters(members: Member[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [registrationFilter, setRegistrationFilter] =
    useState<RegistrationFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (
        registrationFilter !== "all" &&
        member.registrationStatus !== registrationFilter
      ) {
        return false;
      }

      if (activeFilter === "active" && !member.isActive) return false;
      if (activeFilter === "inactive" && member.isActive) return false;

      if (!searchQuery.trim()) return true;

      const haystack =
        `${member.firstName} ${member.lastName} ${member.email}`.toLowerCase();
      return haystack.includes(searchQuery.trim().toLowerCase());
    });
  }, [members, registrationFilter, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const base = { completed: 0, pending: 0, expired: 0 };
    members.forEach((member) => {
      base[member.registrationStatus] += 1;
    });
    return {
      ...base,
      all: members.length,
      active: members.filter((member) => member.isActive).length,
      inactive: members.filter((member) => !member.isActive).length,
    };
  }, [members]);

  return {
    searchQuery,
    setSearchQuery,
    registrationFilter,
    setRegistrationFilter,
    activeFilter,
    setActiveFilter,
    filteredMembers,
    counts,
  };
}


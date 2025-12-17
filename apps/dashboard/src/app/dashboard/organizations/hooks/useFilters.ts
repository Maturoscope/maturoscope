import { useState, useMemo } from "react";
import {
  Organization,
  ActiveFilter,
  RegistrationFilter,
} from "../types/organization";

export function useFilters(organizations: Organization[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [registrationFilter, setRegistrationFilter] =
    useState<RegistrationFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((organization) => {
      if (
        registrationFilter !== "all" &&
        organization.registrationStatus !== registrationFilter
      ) {
        return false;
      }

      if (activeFilter === "active" && !organization.isActive) return false;
      if (activeFilter === "inactive" && organization.isActive) return false;

      if (!searchQuery.trim()) return true;

      const haystack =
        `${organization.name} ${organization.email} ${organization.userEmail || ""}`.toLowerCase();
      return haystack.includes(searchQuery.trim().toLowerCase());
    });
  }, [organizations, registrationFilter, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const base = { completed: 0, pending: 0, expired: 0 };
    organizations.forEach((organization) => {
      base[organization.registrationStatus] += 1;
    });
    return {
      ...base,
      all: organizations.length,
      active: organizations.filter((organization) => organization.isActive).length,
      inactive: organizations.filter((organization) => !organization.isActive).length,
    };
  }, [organizations]);

  return {
    searchQuery,
    setSearchQuery,
    registrationFilter,
    setRegistrationFilter,
    activeFilter,
    setActiveFilter,
    filteredOrganizations,
    counts,
  };
}


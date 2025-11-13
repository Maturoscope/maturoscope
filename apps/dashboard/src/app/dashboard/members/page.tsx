"use client";

import React, { useMemo } from "react";
import { DynamicPageHeader } from "@/components/DynamicPageHeader";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";
import { useMembers } from "./hooks/useMembers";
import { useFilters } from "./hooks/useFilters";
import { MembersHeader } from "./components/MembersHeader";
import { MembersTable } from "./components/MembersTable";

export default function MembersPage() {
  const { user } = useUserContext();
  const organizationId = user?.organization?.id;

  const {
    members,
    loading,
    error,
    resendingUserId,
    fetchMembers,
    handleToggleActive,
    handleResendInvitation,
  } = useMembers(organizationId);

  const {
    searchQuery,
    setSearchQuery,
    registrationFilter,
    setRegistrationFilter,
    activeFilter,
    setActiveFilter,
    filteredMembers,
    counts,
  } = useFilters(members);

  const breadcrumbs = useMemo(() => {
    const organizationName = user?.organization?.name || "Organization";
    return [{ label: organizationName }, { label: "Members" }];
  }, [user?.organization?.name]);

  return (
    <>
      <DynamicPageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6 text-[#0A0A0A] mt-5">
        <MembersHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          registrationFilter={registrationFilter}
          onRegistrationFilterChange={setRegistrationFilter}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
          activeCounts={{ active: counts.active, inactive: counts.inactive }}
          organizationId={organizationId || ""}
          onMemberCreated={fetchMembers}
        />

        <MembersTable
          members={filteredMembers}
          loading={loading}
          error={error}
          resendingUserId={resendingUserId}
          onToggleActive={handleToggleActive}
          onResendInvitation={handleResendInvitation}
        />
      </div>
    </>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DynamicPageHeader } from "@/components/DynamicPageHeader";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";
import { Toast } from "@/components/ui/toast";
import { useMembers } from "./hooks/useMembers";
import { useFilters } from "./hooks/useFilters";
import { MembersHeader } from "./components/MembersHeader";
import { MembersTable } from "./components/MembersTable";
import { Member } from "./types/member";

export default function MembersPage() {
  const { t } = useTranslation("MEMBERS");
  const { t: tDashboard } = useTranslation("DASHBOARD");
  const { user } = useUserContext();
  const organizationId = user?.organization?.id;
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [createdMemberName, setCreatedMemberName] = useState("");
  const [showDeactivateToast, setShowDeactivateToast] = useState(false);
  const [showReactivateToast, setShowReactivateToast] = useState(false);
  const [toggledMemberName, setToggledMemberName] = useState("");

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
    const organizationName = user?.organization?.name || tDashboard("ORGANIZATION");
    return [{ label: organizationName }, { label: tDashboard("MEMBERS") }];
  }, [user?.organization?.name, tDashboard]);

  const handleMemberCreated = (memberName: string) => {
    setCreatedMemberName(memberName);
    setShowSuccessToast(true);
    fetchMembers();
  };

  const handleToggleActiveWithToast = (member: Member, value: boolean) => {
    handleToggleActive(member, value, (memberName: string, wasActivated: boolean) => {
      setToggledMemberName(memberName);
      if (wasActivated) {
        setShowReactivateToast(true);
      } else {
        setShowDeactivateToast(true);
      }
    });
  };

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
          onMemberCreated={handleMemberCreated}
        />

        <MembersTable
          members={filteredMembers}
          loading={loading}
          error={error}
          resendingUserId={resendingUserId}
          activeFilter={activeFilter}
          registrationFilter={registrationFilter}
          onToggleActive={handleToggleActiveWithToast}
          onResendInvitation={handleResendInvitation}
          organizationEmail={user?.organization?.email}
        />
      </div>

      <Toast
        title={t("TOASTS.MEMBER_CREATED.TITLE")}
        description={t("TOASTS.MEMBER_CREATED.DESCRIPTION", { name: createdMemberName })}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        showIcon={false}
      />

      <Toast
        title={t("TOASTS.MEMBER_DEACTIVATED.TITLE")}
        description={t("TOASTS.MEMBER_DEACTIVATED.DESCRIPTION", { name: toggledMemberName })}
        isVisible={showDeactivateToast}
        onClose={() => setShowDeactivateToast(false)}
        onUndo={() => {
          const member = members.find(m => `${m.firstName} ${m.lastName}` === toggledMemberName);
          if (member) {
            handleToggleActive(member, true);
          }
          setShowDeactivateToast(false);
        }}
        undoText={t("TOASTS.UNDO")}
        showIcon={false}
      />

      <Toast
        title={t("TOASTS.MEMBER_REACTIVATED.TITLE")}
        description={t("TOASTS.MEMBER_REACTIVATED.DESCRIPTION", { name: toggledMemberName })}
        isVisible={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        onUndo={() => {
          const member = members.find(m => `${m.firstName} ${m.lastName}` === toggledMemberName);
          if (member) {
            handleToggleActive(member, false);
          }
          setShowReactivateToast(false);
        }}
        undoText={t("TOASTS.UNDO")}
        showIcon={false}
      />
    </>
  );
}

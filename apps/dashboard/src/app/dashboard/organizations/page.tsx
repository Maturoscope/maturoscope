"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { DynamicPageHeader } from "@/components/DynamicPageHeader";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";
import { Toast } from "@/components/ui/toast";
import { useOrganizations } from "./hooks/useOrganizations";
import { useFilters } from "./hooks/useFilters";
import { OrganizationsHeader } from "./components/OrganizationsHeader";
import { OrganizationsTable } from "./components/OrganizationsTable";
import { Organization } from "./types/organization";

export default function OrganizationsPage() {
  const { t } = useTranslation("ORGANIZATIONS");
  const { t: tDashboard } = useTranslation("DASHBOARD");
  const { user, loading: userLoading } = useUserContext();
  const router = useRouter();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [createdOrganizationName, setCreatedOrganizationName] = useState("");
  const [showDeactivateToast, setShowDeactivateToast] = useState(false);
  const [showReactivateToast, setShowReactivateToast] = useState(false);
  const [toggledOrganizationName, setToggledOrganizationName] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (!userLoading && user) {
      const userRoles = user?.roles || [];
      const hasAdminAccess = userRoles.includes('admin');
      
      if (!hasAdminAccess) {
        router.push('/dashboard');
      }
    }
  }, [user, userLoading, router]);

  const {
    organizations,
    loading,
    error,
    resendingUserId,
    fetchOrganizations,
    handleToggleActive,
    handleResendInvitation,
  } = useOrganizations();

  const {
    searchQuery,
    setSearchQuery,
    registrationFilter,
    setRegistrationFilter,
    activeFilter,
    setActiveFilter,
    filteredOrganizations,
    counts,
  } = useFilters(organizations);

  const breadcrumbs = useMemo(() => {
    return [{ label: tDashboard("SUPER_ADMIN") }, { label: tDashboard("ORGANIZATIONS") }];
  }, [tDashboard]);

  const handleOrganizationCreated = (organizationName: string) => {
    setCreatedOrganizationName(organizationName);
    setShowSuccessToast(true);
    fetchOrganizations();
  };

  const handleToggleActiveWithToast = (organization: Organization, value: boolean) => {
    handleToggleActive(organization, value, (organizationName: string, wasActivated: boolean) => {
      setToggledOrganizationName(organizationName);
      if (wasActivated) {
        setShowReactivateToast(true);
      } else {
        setShowDeactivateToast(true);
      }
    });
  };

  // Show loading or nothing while checking admin access
  if (userLoading || !user) {
    return null;
  }

  const userRoles = user?.roles || [];
  const hasAdminAccess = userRoles.includes('admin');
  
  if (!hasAdminAccess) {
    return null;
  }

  return (
    <>
      <DynamicPageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6 text-[#0A0A0A] mt-5">
        <OrganizationsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          registrationFilter={registrationFilter}
          onRegistrationFilterChange={setRegistrationFilter}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
          activeCounts={{ active: counts.active, inactive: counts.inactive }}
          onOrganizationCreated={handleOrganizationCreated}
        />

        <OrganizationsTable
          organizations={filteredOrganizations}
          loading={loading}
          error={error}
          resendingUserId={resendingUserId}
          activeFilter={activeFilter}
          registrationFilter={registrationFilter}
          onToggleActive={handleToggleActiveWithToast}
          onResendInvitation={handleResendInvitation}
        />
      </div>

      <Toast
        title={t("TOASTS.ORGANIZATION_CREATED.TITLE")}
        description={t("TOASTS.ORGANIZATION_CREATED.DESCRIPTION", { name: createdOrganizationName })}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        showIcon={false}
      />

      <Toast
        title={t("TOASTS.ORGANIZATION_DEACTIVATED.TITLE")}
        description={t("TOASTS.ORGANIZATION_DEACTIVATED.DESCRIPTION", { name: toggledOrganizationName })}
        isVisible={showDeactivateToast}
        onClose={() => setShowDeactivateToast(false)}
        onUndo={() => {
          const organization = organizations.find(o => o.name === toggledOrganizationName);
          if (organization) {
            handleToggleActive(organization, true);
          }
          setShowDeactivateToast(false);
        }}
        undoText={t("TOASTS.UNDO")}
        showIcon={false}
      />

      <Toast
        title={t("TOASTS.ORGANIZATION_REACTIVATED.TITLE")}
        description={t("TOASTS.ORGANIZATION_REACTIVATED.DESCRIPTION", { name: toggledOrganizationName })}
        isVisible={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        onUndo={() => {
          const organization = organizations.find(o => o.name === toggledOrganizationName);
          if (organization) {
            handleToggleActive(organization, false);
          }
          setShowReactivateToast(false);
        }}
        undoText={t("TOASTS.UNDO")}
        showIcon={false}
      />
    </>
  );
}

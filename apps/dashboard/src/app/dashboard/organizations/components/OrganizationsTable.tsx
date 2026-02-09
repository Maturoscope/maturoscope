import React, { useState } from "react";
import { Info, Loader2, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Organization } from "../types/organization";
import { RegistrationBadge } from "./RegistrationBadge";

interface OrganizationsTableProps {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  resendingUserId: string | null;
  activeFilter: "all" | "active" | "inactive";
  registrationFilter: "all" | "completed" | "pending" | "expired";
  onToggleActive: (organization: Organization, value: boolean) => void;
  onResendInvitation: (organization: Organization) => void;
}

export function OrganizationsTable({
  organizations,
  loading,
  error,
  resendingUserId,
  activeFilter,
  registrationFilter,
  onToggleActive,
  onResendInvitation,
}: OrganizationsTableProps) {
  const { t } = useTranslation("ORGANIZATIONS");
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [organizationToDeactivate, setOrganizationToDeactivate] = useState<Organization | null>(null);

  // Helper function to get empty state messages based on filters
  const getEmptyStateMessages = () => {
    const messageMap: Record<string, { title: string; description: string }> = {
      completed: {
        title: t("TABLE.NO_COMPLETED_ORGANIZATIONS"),
        description: t("TABLE.NO_COMPLETED_ORGANIZATIONS_DESCRIPTION"),
      },
      pending: {
        title: t("TABLE.NO_PENDING_ORGANIZATIONS"),
        description: t("TABLE.NO_PENDING_ORGANIZATIONS_DESCRIPTION"),
      },
      expired: {
        title: t("TABLE.NO_EXPIRED_ORGANIZATIONS"),
        description: t("TABLE.NO_EXPIRED_ORGANIZATIONS_DESCRIPTION"),
      },
      inactive: {
        title: t("TABLE.NO_INACTIVE_ORGANIZATIONS"),
        description: t("TABLE.NO_INACTIVE_ORGANIZATIONS_DESCRIPTION"),
      },
      active: {
        title: t("TABLE.NO_ACTIVE_ORGANIZATIONS"),
        description: t("TABLE.NO_ACTIVE_ORGANIZATIONS_DESCRIPTION"),
      },
      default: {
        title: t("TABLE.NO_RESULTS"),
        description: t("TABLE.EMPTY_DESCRIPTION"),
      },
    };

    // Priority: registration filter first, then active filter, then default
    if (registrationFilter !== "all") {
      return messageMap[registrationFilter] || messageMap.default;
    }
    if (activeFilter !== "all") {
      return messageMap[activeFilter] || messageMap.default;
    }
    return messageMap.default;
  };

  const handleSwitchChange = (organization: Organization, value: boolean) => {
    if (!value) {
      // User is trying to deactivate - show confirmation dialog
      setOrganizationToDeactivate(organization);
      setShowDeactivateDialog(true);
    } else {
      // User is activating - proceed directly
      onToggleActive(organization, value);
    }
  };

  const handleConfirmDeactivate = () => {
    if (organizationToDeactivate) {
      onToggleActive(organizationToDeactivate, false);
      setShowDeactivateDialog(false);
      setOrganizationToDeactivate(null);
    }
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateDialog(false);
    setOrganizationToDeactivate(null);
  };

  return (
    <>
    <div className="overflow-hidden rounded-[8px] border border-slate-200">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
        <table className="min-w-full divide-y divide-[#E5E5E5] text-[#0A0A0A]">
          <thead className="bg-[#F5F5F5] text-sm text-[#0A0A0A] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left font-medium bg-[#F5F5F5]">{t("TABLE.HEADERS.ORGANIZATION_NAME")}</th>
              <th className="px-6 py-3 text-left font-medium bg-[#F5F5F5]">{t("TABLE.HEADERS.EMAIL")}</th>
              <th className="px-6 py-3 text-left font-medium bg-[#F5F5F5]">
                <div className="flex items-center gap-2">
                  {t("TABLE.HEADERS.REGISTRATION")}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-[#0A0A0A]/40 transition hover:text-[#0A0A0A]/70"
                      >
                        <Info className="h-4 w-4 text-[#0A0A0A]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs text-xs text-center"
                    >
                      {t("TABLE.TOOLTIPS.REGISTRATION")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </th>
              <th className="px-6 py-3 text-left font-medium bg-[#F5F5F5]">
                <div className="flex items-center gap-2">
                  {t("TABLE.HEADERS.ACTIVE")}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-[#0A0A0A]/40 transition hover:text-[#0A0A0A]/70"
                      >
                        <Info className="h-4 w-4 text-[#0A0A0A]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs text-xs text-center"
                    >
                      {t("TABLE.TOOLTIPS.ACTIVE")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm text-[#0A0A0A] divide-y divide-slate-200">
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-[#0A0A0A]/60"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-[#0A0A0A]/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("TABLE.LOADING")}
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              organizations.map((organization) => (
                <tr key={organization.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-[#0A0A0A]">
                    {organization.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0A0A0A]">
                    {organization.userEmail || organization.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <RegistrationBadge
                      status={organization.registrationStatus}
                      onResend={() => onResendInvitation(organization)}
                      isResending={resendingUserId === organization.id}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Switch
                      checked={organization.isActive}
                      onCheckedChange={(value) => handleSwitchChange(organization, value)}
                      aria-label={`Toggle active status for ${organization.name}`}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>

    {!loading && organizations.length === 0 && (
      <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-[#E5E5E5] bg-white mt-[-15px]" style={{ height: 'calc(100vh - 265px)' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E5E5] shadow-xs">
          <Building2 className="h-6 w-6 text-[#0A0A0A]" strokeWidth={1.5} fill="none" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">
            {error ? "Error loading organizations" : getEmptyStateMessages().title}
          </h3>
          <p className="text-sm text-[#737373]">
            {error ? error : getEmptyStateMessages().description}
          </p>
        </div>
      </div>
    )}

    <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("DEACTIVATE_ORGANIZATION.TITLE", {
              name: organizationToDeactivate ? organizationToDeactivate.name : ""
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("DEACTIVATE_ORGANIZATION.MESSAGE")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={handleConfirmDeactivate}
            className="text-red-600 hover:text-red-700 border-gray-300"
          >
            {t("DEACTIVATE_ORGANIZATION.CONFIRM")}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancelDeactivate}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {t("DEACTIVATE_ORGANIZATION.CANCEL")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


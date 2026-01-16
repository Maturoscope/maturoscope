import React, { useState, useMemo } from "react";
import { Info, User } from "lucide-react";
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
import { Member } from "../types/member";
import { RegistrationBadge } from "./RegistrationBadge";

interface MembersTableProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  resendingUserId: string | null;
  activeFilter: "all" | "active" | "inactive";
  registrationFilter: "all" | "completed" | "pending" | "expired";
  onToggleActive: (member: Member, value: boolean) => void;
  onResendInvitation: (member: Member) => void;
  organizationEmail?: string;
  currentUserEmail?: string;
}

export function MembersTable({
  members,
  loading,
  error,
  resendingUserId,
  activeFilter,
  registrationFilter,
  onToggleActive,
  onResendInvitation,
  organizationEmail,
  currentUserEmail,
}: MembersTableProps) {
  const { t } = useTranslation("MEMBERS");
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [memberToDeactivate, setMemberToDeactivate] = useState<Member | null>(null);

  const emptyStateMessages = useMemo(() => {
    if (activeFilter === "inactive") {
      return {
        title: t("TABLE.NO_INACTIVE_MEMBERS"),
        description: t("TABLE.NO_INACTIVE_MEMBERS_DESCRIPTION"),
      };
    }

    if (registrationFilter === "all" && activeFilter === "all") {
      return {
        title: t("TABLE.NO_RESULTS"),
        description: t("TABLE.EMPTY_DESCRIPTION"),
      };
    }

    if (registrationFilter !== "all") {
      return {
        title: t("TABLE.NO_MEMBERS_AVAILABLE"),
        description: t("TABLE.NO_MEMBERS_AVAILABLE_DESCRIPTION"),
      };
    }

    if (activeFilter === "active") {
      return {
        title: t("TABLE.NO_MEMBERS_AVAILABLE"),
        description: t("TABLE.NO_MEMBERS_AVAILABLE_DESCRIPTION"),
      };
    }

    return {
      title: t("TABLE.NO_RESULTS"),
      description: t("TABLE.EMPTY_DESCRIPTION"),
    };
  }, [t, activeFilter, registrationFilter]);

  const isAdmin = (member: Member): boolean => {
    return organizationEmail ? member.email.toLowerCase() === organizationEmail.toLowerCase() : false;
  };

  const isCurrentUser = (member: Member): boolean => {
    return currentUserEmail ? member.email.toLowerCase() === currentUserEmail.toLowerCase() : false;
  };

  const isSwitchDisabled = (member: Member): boolean => {
    return isAdmin(member) || isCurrentUser(member);
  };

  const handleSwitchChange = (member: Member, value: boolean) => {
    if (!value && isSwitchDisabled(member)) {
      return;
    }
    
    if (!value) {
      setMemberToDeactivate(member);
      setShowDeactivateDialog(true);
    } else {
      onToggleActive(member, value);
    }
  };

  const handleConfirmDeactivate = () => {
    if (memberToDeactivate) {
      onToggleActive(memberToDeactivate, false);
      setShowDeactivateDialog(false);
      setMemberToDeactivate(null);
    }
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateDialog(false);
    setMemberToDeactivate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{t("TABLE.LOADING")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="overflow-hidden rounded-[8px] border border-slate-200">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
        <table className="min-w-full divide-y divide-[#E5E5E5] text-[#0A0A0A]">
          <thead className="bg-[#F5F5F5] text-sm text-[#0A0A0A] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left font-medium bg-[#F5F5F5]">{t("TABLE.HEADERS.FIRST_NAME")}</th>
              <th className="px-6 py-3 text-left font-medium bg-[#F5F5F5]">{t("TABLE.HEADERS.LAST_NAME")}</th>
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
            {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-[#0A0A0A]">
                    {member.firstName}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0A0A0A]">
                    {member.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0A0A0A]">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <RegistrationBadge
                      status={member.registrationStatus}
                      onResend={() => onResendInvitation(member)}
                      isResending={resendingUserId === member.id}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Switch
                      checked={member.isActive}
                      onCheckedChange={(value) => handleSwitchChange(member, value)}
                      disabled={isSwitchDisabled(member)}
                      aria-label={`Toggle active status for ${member.firstName} ${member.lastName}`}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>

    {!loading && members.length === 0 && (
      <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-[#E5E5E5] bg-white mt-[-15px]" style={{ height: 'calc(100vh - 265px)' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E5E5] shadow-xs">
          <User className="h-6 w-6 text-[#0A0A0A]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">
            {error ? "Error loading members" : emptyStateMessages.title}
          </h3>
          <p className="text-sm text-[#737373]">
            {error ? error : emptyStateMessages.description}
          </p>
        </div>
      </div>
    )}

    <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("DEACTIVATE_USER.TITLE", {
              name: memberToDeactivate ? `${memberToDeactivate.firstName} ${memberToDeactivate.lastName}` : ""
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("DEACTIVATE_USER.MESSAGE")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={handleConfirmDeactivate}
            className="text-red-600 hover:text-red-700 border-gray-300"
          >
            {t("DEACTIVATE_USER.CONFIRM")}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancelDeactivate}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {t("DEACTIVATE_USER.CANCEL")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


import React, { useState } from "react";
import { Info, Loader2, User } from "lucide-react";
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
  onToggleActive: (member: Member, value: boolean) => void;
  onResendInvitation: (member: Member) => void;
}

export function MembersTable({
  members,
  loading,
  error,
  resendingUserId,
  activeFilter,
  onToggleActive,
  onResendInvitation,
}: MembersTableProps) {
  const { t } = useTranslation("MEMBERS");
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [memberToDeactivate, setMemberToDeactivate] = useState<Member | null>(null);

  const handleSwitchChange = (member: Member, value: boolean) => {
    if (!value) {
      // User is trying to deactivate - show confirmation dialog
      setMemberToDeactivate(member);
      setShowDeactivateDialog(true);
    } else {
      // User is activating - proceed directly
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

  return (
    <>
    <div className="overflow-hidden rounded-[8px] border border-slate-200">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
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
                        <Info className="h-4 w-4" />
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
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
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
                  colSpan={5}
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
              members.map((member) => (
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
      <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border-1 border-dashed border-[#E5E5E5] bg-white mt-[-15px]" style={{ height: 'calc(100vh - 230px)' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E5E5] shadow-xs">
          <User className="h-6 w-6 text-[#0A0A0A]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">
            {error 
              ? "Error loading members" 
              : activeFilter === "inactive" 
                ? t("TABLE.NO_INACTIVE_MEMBERS")
                : t("TABLE.NO_RESULTS")
            }
          </h3>
          <p className="text-sm text-[#737373]">
            {error 
              ? error 
              : activeFilter === "inactive"
                ? t("TABLE.NO_INACTIVE_MEMBERS_DESCRIPTION")
                : t("TABLE.EMPTY_DESCRIPTION")
            }
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
          <AlertDialogCancel onClick={handleCancelDeactivate}>
            {t("DEACTIVATE_USER.CANCEL")}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDeactivate}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {t("DEACTIVATE_USER.CONFIRM")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


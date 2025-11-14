import React from "react";
import { Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Member } from "../types/member";
import { RegistrationBadge } from "./RegistrationBadge";

interface MembersTableProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  resendingUserId: string | null;
  onToggleActive: (member: Member, value: boolean) => void;
  onResendInvitation: (member: Member) => void;
}

export function MembersTable({
  members,
  loading,
  error,
  resendingUserId,
  onToggleActive,
  onResendInvitation,
}: MembersTableProps) {
  const { t } = useTranslation("MEMBERS");

  return (
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
          <tbody className="divide-y divide-slate-200 bg-white text-sm text-[#0A0A0A]">
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
            {!loading && members.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[#0A0A0A]/60"
                >
                  {error ? error : t("TABLE.NO_RESULTS")}
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
                      onCheckedChange={(value) => onToggleActive(member, value)}
                      aria-label={`Toggle active status for ${member.firstName} ${member.lastName}`}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


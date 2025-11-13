import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RegistrationStatus,
  registrationDotClasses,
} from "../types/member";

interface RegistrationBadgeProps {
  status: RegistrationStatus;
  onResend?: () => void;
  isResending?: boolean;
}

export function RegistrationBadge({
  status,
  onResend,
  isResending,
}: RegistrationBadgeProps) {
  const { t } = useTranslation("MEMBERS");
  
  const statusLabels = {
    completed: t("REGISTRATION_STATUS.COMPLETED"),
    pending: t("REGISTRATION_STATUS.PENDING"),
    expired: t("REGISTRATION_STATUS.EXPIRED"),
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[8px] border border-[#E5E5E5] bg-white px-3 pt-0.5 pb-0.5 text-xs font-medium text-[#0A0A0A]"
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full border border-[#E5E5E5]",
          registrationDotClasses[status]
        )}
      />
      {statusLabels[status]}
      {status === "expired" && onResend && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResend();
              }}
              disabled={isResending}
              className={cn(
                "ml-1 rounded-full p-0.5 transition-colors hover:bg-slate-100",
                isResending && "cursor-not-allowed opacity-50"
              )}
              aria-label={t("TABLE.RESEND_INVITATION")}
            >
              <RefreshCw
                className={cn("h-3 w-3", isResending && "animate-spin")}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t("TABLE.RESEND_INVITATION")}
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}


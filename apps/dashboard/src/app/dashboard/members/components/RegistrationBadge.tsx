import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RegistrationStatus,
  registrationStatusLabels,
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
      {registrationStatusLabels[status]}
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
              aria-label="Resend invitation"
            >
              <RefreshCw
                className={cn("h-3 w-3", isResending && "animate-spin")}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Resend invitation
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}


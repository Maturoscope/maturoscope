"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface BlockedAccountProps extends React.ComponentPropsWithoutRef<"div"> {
  onGoBack: () => void;
}

export default function BlockedAccount({
  className,
  onGoBack,
  ...props
}: BlockedAccountProps) {
  const { t } = useTranslation("LOGIN");

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 30, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "tween",
      }}
    >
      <div
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <h1 className="text-2xl font-bold text-black">
            {t("BLOCKED_ACCOUNT.TITLE")}
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              {t("BLOCKED_ACCOUNT.MESSAGE")}
            </p>
            <p className="text-accent-foreground  text-sm leading-relaxed">
              {t("BLOCKED_ACCOUNT.EMAIL_SENT")}
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            {t("BLOCKED_ACCOUNT.GO_BACK_TO")}{" "}
            <button
              onClick={onGoBack}
              className="text-black underline hover:no-underline cursor-pointer"
            >
              {t("BLOCKED_ACCOUNT.SIGN_IN")}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

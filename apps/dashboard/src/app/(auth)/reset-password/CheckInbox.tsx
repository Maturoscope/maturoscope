"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckInboxProps extends React.ComponentPropsWithoutRef<"div"> {
  email: string;
  onBackToLogin: () => void;
  onEditEmail: () => void;
}

export default function CheckInbox({
  className,
  email,
  onBackToLogin,
  onEditEmail,
  ...props
}: CheckInboxProps) {
  const { t } = useTranslation("LOGIN");

  const getMessage = () => {
    return t("CHECK_INBOX.MESSAGE").replace("[email]", email);
  };

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
            {t("CHECK_INBOX.TITLE")}
          </h1>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {getMessage()}
          </p>
        </div>

        <div className="grid gap-3">
          <Button
            type="button"
            className="w-full bg-black text-white hover:bg-gray-800"
            onClick={onBackToLogin}
          >
            {t("CHECK_INBOX.BACK_TO_LOGIN")}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onEditEmail}
          >
            {t("CHECK_INBOX.EDIT_EMAIL")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

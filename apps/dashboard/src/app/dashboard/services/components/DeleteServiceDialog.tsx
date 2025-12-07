"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface DeleteServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string;
}

export function DeleteServiceDialog({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
}: DeleteServiceDialogProps) {
  const { t } = useTranslation("SERVICES");

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#0A0A0A] font-semibold">
            {t("DELETE_DIALOG.TITLE", { serviceName })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500">
            {t("DELETE_DIALOG.DESCRIPTION")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={onConfirm}
            className="bg-white border border-gray-300 text-red-500 font-semibold hover:bg-white hover:text-red-600 rounded-[8px]"
          >
            {t("DELETE_DIALOG.CONFIRM")}
          </Button>
          <Button
            onClick={onClose}
            className="bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/90 rounded-[8px]"
          >
            {t("DELETE_DIALOG.CANCEL")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


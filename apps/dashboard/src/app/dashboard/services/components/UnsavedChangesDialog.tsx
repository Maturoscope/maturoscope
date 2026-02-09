import React from "react";
import { useTranslation } from "react-i18next";
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

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  const { t } = useTranslation("SERVICES");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("MODAL.UNSAVED_CHANGES.TITLE")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("MODAL.UNSAVED_CHANGES.MESSAGE")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onConfirm}>
            {t("MODAL.UNSAVED_CHANGES.LEAVE_ANYWAY")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onCancel}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {t("MODAL.UNSAVED_CHANGES.CANCEL")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


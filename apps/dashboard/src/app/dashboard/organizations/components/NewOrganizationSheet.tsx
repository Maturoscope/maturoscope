import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNewOrganizationForm } from "../hooks/useNewOrganizationForm";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

interface NewOrganizationSheetProps {
  onSuccess: (organizationName: string) => void;
}

export function NewOrganizationSheet({
  onSuccess,
}: NewOrganizationSheetProps) {
  const { t } = useTranslation("ORGANIZATIONS");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const {
    formState,
    setFormState,
    formErrors,
    setFormErrors,
    formTouched,
    setFormTouched,
    formFeedback,
    formSubmitting,
    hasUnsavedChanges,
    isFormValid,
    validateField,
    resetForm,
    handleSubmit,
  } = useNewOrganizationForm();

  const handleSheetOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      setShowUnsavedAlert(true);
    } else {
      setIsSheetOpen(open);
      if (!open) {
        resetForm();
      }
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedAlert(false);
    setIsSheetOpen(false);
    resetForm();
  };

  const handleCancelClose = () => {
    setShowUnsavedAlert(false);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    await handleSubmit(event, (organizationName: string) => {
      setIsSheetOpen(false);
      onSuccess(organizationName);
    });
  };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="mr-2 h-4 w-4" />
            {t("ADD_ORGANIZATION_BUTTON")}
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[580px] text-[#0A0A0A]">
          <SheetHeader className="pb-1">
            <SheetTitle className="text-lg font-semibold">
              {t("NEW_ORGANIZATION.TITLE")}
            </SheetTitle>
          </SheetHeader>
          <div className="w-[95%] mx-auto border-b border-slate-200 " />
          <form
            className="flex flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={onSubmit}
          >
            <div className="grid gap-2">
              <Label htmlFor="name">{t("NEW_ORGANIZATION.FIELDS.NAME.LABEL")}{t("NEW_ORGANIZATION.FIELDS.NAME.REQUIRED")}</Label>
              <Input
                id="name"
                placeholder={t("NEW_ORGANIZATION.FIELDS.NAME.PLACEHOLDER")}
                value={formState.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    name: value,
                  }));
                }}
                onFocus={() => {
                  setFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                onBlur={() => {
                  setFormTouched((prev) => ({ ...prev, name: true }));
                  validateField("name", formState.name);
                }}
                className={cn(
                  formTouched.name &&
                    formErrors.name &&
                    "border-destructive"
                )}
              />
              <div className="min-h-[20px]">
                {formTouched.name && formErrors.name && (
                  <p className="text-xs text-destructive">
                    {formErrors.name}
                  </p>
                )}
                {formTouched.name && !formErrors.name && (
                  <p className="text-xs text-muted-foreground">
                    {t("NEW_ORGANIZATION.FIELDS.NAME.HELPER_TEXT")}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("NEW_ORGANIZATION.FIELDS.EMAIL.LABEL")}{t("NEW_ORGANIZATION.FIELDS.EMAIL.REQUIRED")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("NEW_ORGANIZATION.FIELDS.EMAIL.PLACEHOLDER")}
                value={formState.email}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    email: value,
                  }));
                }}
                onFocus={() => {
                  setFormErrors((prev) => ({ ...prev, email: "" }));
                }}
                onBlur={() => {
                  setFormTouched((prev) => ({ ...prev, email: true }));
                  validateField("email", formState.email);
                  // Re-validate confirm email if it's been touched
                  if (formTouched.confirmEmail && formState.confirmEmail) {
                    validateField("confirmEmail", formState.confirmEmail);
                  }
                }}
                className={cn(
                  formTouched.email && formErrors.email && "border-destructive"
                )}
              />
              <div className="min-h-[20px]">
                {formTouched.email && formErrors.email ? (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("NEW_ORGANIZATION.FIELDS.EMAIL.HELPER_TEXT")}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmEmail">{t("NEW_ORGANIZATION.FIELDS.CONFIRM_EMAIL.LABEL")}{t("NEW_ORGANIZATION.FIELDS.CONFIRM_EMAIL.REQUIRED")}</Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder={t("NEW_ORGANIZATION.FIELDS.CONFIRM_EMAIL.PLACEHOLDER")}
                value={formState.confirmEmail}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    confirmEmail: value,
                  }));
                }}
                onFocus={() => {
                  setFormErrors((prev) => ({ ...prev, confirmEmail: "" }));
                }}
                onBlur={() => {
                  setFormTouched((prev) => ({ ...prev, confirmEmail: true }));
                  validateField("confirmEmail", formState.confirmEmail);
                }}
                className={cn(
                  formTouched.confirmEmail &&
                    formErrors.confirmEmail &&
                    "border-destructive"
                )}
              />
              <div className="min-h-[20px]">
                {formTouched.confirmEmail && formErrors.confirmEmail && (
                  <p className="text-xs text-destructive">
                    {formErrors.confirmEmail}
                  </p>
                )}
              </div>
            </div>

            {formFeedback && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formFeedback}
              </div>
            )}

            <SheetFooter className="sm:justify-end">
              <Button
                type="submit"
                disabled={!isFormValid || formSubmitting}
                className="w-[140px] ml-auto"
              >
                {formSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("NEW_ORGANIZATION.BUTTONS.CREATING")}
                  </span>
                ) : (
                  t("NEW_ORGANIZATION.BUTTONS.CREATE")
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <UnsavedChangesDialog
        open={showUnsavedAlert}
        onOpenChange={setShowUnsavedAlert}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </>
  );
}


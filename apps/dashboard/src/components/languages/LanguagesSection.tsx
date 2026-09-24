"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useLanguages } from "./useLanguages";
import { ManageTranslationsModal } from "./ManageTranslationsModal";
import { LanguageCode, LanguageStatus } from "@/services/languages.service";

export function LanguagesSection() {
  const { t } = useTranslation("LANGUAGES");
  const { t: tName } = useTranslation("LANGUAJES");
  const { languages, loading, error, toggle, setDefault, refetch } = useLanguages();

  const [pendingDisable, setPendingDisable] = useState<LanguageCode | null>(null);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(
    null,
  );
  const [modal, setModal] = useState<{
    code: LanguageCode;
    mode: "edit" | "review";
  } | null>(null);

  const name = (code: LanguageCode) => tName(code.toUpperCase());
  const label = (code: LanguageCode) => `${name(code)} (${code.toUpperCase()})`;

  const showToast = (title: string, description: string) => {
    setToast({ title, description });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (lang: LanguageStatus, next: boolean) => {
    // Turning a language off is destructive to the user experience, so confirm.
    if (!next) {
      setPendingDisable(lang.code);
      return;
    }
    try {
      await toggle(lang.code, true);
      showToast(
        t("TOASTS.ACTIVATED.TITLE", { language: name(lang.code) }),
        t("TOASTS.ACTIVATED.DESCRIPTION"),
      );
    } catch (e) {
      showToast(t("TOASTS.ERROR.TITLE"), e instanceof Error ? e.message : "");
    }
  };

  const confirmDisable = async () => {
    if (!pendingDisable) return;
    const code = pendingDisable;
    setPendingDisable(null);
    try {
      await toggle(code, false);
      showToast(
        t("TOASTS.DEACTIVATED.TITLE", { language: name(code) }),
        t("TOASTS.DEACTIVATED.DESCRIPTION"),
      );
    } catch (e) {
      showToast(t("TOASTS.ERROR.TITLE"), e instanceof Error ? e.message : "");
    }
  };

  const defaultCode = languages.find((l) => l.isDefault)?.code;
  const liveLanguages = languages.filter((l) => l.status === "live");
  // The default language is always listed first; the rest keep canonical order.
  const orderedLanguages = [...languages].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );

  const handleDefaultChange = async (code: string) => {
    if (code === defaultCode) return;
    try {
      await setDefault(code as LanguageCode);
    } catch (e) {
      showToast(t("TOASTS.ERROR.TITLE"), e instanceof Error ? e.message : "");
    }
  };

  const flag = (code: LanguageCode) => (
    <Image
      src={`/icons/${code.toUpperCase()}.svg`}
      alt={code.toUpperCase()}
      width={20}
      height={16}
    />
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("MENU_LABEL")}</h2>

      <Separator />

      {/* Default Language */}
      <div className="flex flex-col space-y-2">
        <Label htmlFor="default-language">{t("DEFAULT_LANGUAGE.LABEL")}</Label>
        <Select value={defaultCode ?? ""} onValueChange={handleDefaultChange}>
          <SelectTrigger
            id="default-language"
            className="max-w-[228px]"
            disabled={loading}
          >
            <SelectValue>
              {defaultCode && (
                <span className="flex items-center gap-2">
                  {flag(defaultCode)}
                  {defaultCode.toUpperCase()}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {liveLanguages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  {flag(lang.code)}
                  {lang.code.toUpperCase()}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">{t("DEFAULT_LANGUAGE.DESCRIPTION")}</p>
      </div>

      <Separator />

      {/* Available Languages */}
      <div>
        <h3 className="text-base font-semibold">{t("SECTION_TITLE")}</h3>
        <p className="mt-1 text-sm text-gray-500">{t("SECTION_DESCRIPTION")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {orderedLanguages.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center gap-4 py-4"
            >
              <Switch
                checked={lang.enabled}
                disabled={lang.isDefault}
                onCheckedChange={(checked) => handleToggle(lang, checked)}
                aria-label={label(lang.code)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {label(lang.code)}
                </span>
                {lang.enabled && (
                  <span
                    className={`text-xs ${
                      lang.status === "live"
                        ? "text-emerald-600"
                        : "text-orange-500"
                    }`}
                  >
                    {lang.status === "live" ? t("STATUS_LIVE") : t("STATUS_DRAFT")}
                  </span>
                )}
              </div>

              <div className="ml-auto">
                {lang.enabled && !lang.isDefault && lang.status === "live" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModal({ code: lang.code, mode: "review" })}
                  >
                    {t("REVIEW")}
                  </Button>
                )}
                {lang.enabled && !lang.isDefault && lang.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModal({ code: lang.code, mode: "edit" })}
                  >
                    {t("TRANSLATE")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Turn-off confirmation */}
      <AlertDialog
        open={pendingDisable !== null}
        onOpenChange={(open) => !open && setPendingDisable(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("TURN_OFF_DIALOG.TITLE", {
                language: pendingDisable ? name(pendingDisable) : "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("TURN_OFF_DIALOG.DESCRIPTION", {
                language: pendingDisable ? name(pendingDisable) : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirmDisable}>
              {t("TURN_OFF_DIALOG.CONFIRM")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setPendingDisable(null)}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {t("TURN_OFF_DIALOG.CANCEL")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {toast && (
        <Toast
          title={toast.title}
          description={toast.description}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}

      {modal && (
        <ManageTranslationsModal
          open={!!modal}
          onOpenChange={(open) => !open && setModal(null)}
          languages={[modal.code]}
          initialLanguage={modal.code}
          mode={modal.mode}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

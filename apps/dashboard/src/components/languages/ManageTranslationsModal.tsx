"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LanguagesService,
  LanguageCode,
  TranslationsResponse,
} from "@/services/languages.service";

type FieldEdits = Record<string, { name: string; description: string }>;

interface ManageTranslationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Target languages shown in the left selector. */
  languages: LanguageCode[];
  initialLanguage?: LanguageCode;
  /** Scope to a single service (per-service edit); otherwise all services. */
  serviceId?: string;
  /** Kept for the caller's intent; translations are always editable. */
  mode?: "edit" | "review";
  /** Called after a successful save so the caller can refresh statuses. */
  onSaved?: () => void;
}

const toEdits = (data: TranslationsResponse): FieldEdits =>
  Object.fromEntries(
    data.services.map((s) => [
      s.serviceId,
      { name: s.name ?? "", description: s.description ?? "" },
    ]),
  );

/** Borderless textarea that grows with its content, matching the source cell. */
function AutoTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-6 text-[#0A0A0A] placeholder:text-gray-400 focus:outline-none focus:ring-0"
    />
  );
}

export function ManageTranslationsModal({
  open,
  onOpenChange,
  languages,
  initialLanguage,
  serviceId,
  onSaved,
}: ManageTranslationsModalProps) {
  const { t } = useTranslation("LANGUAGES");
  const { t: tName } = useTranslation("LANGUAJES");

  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>(
    initialLanguage ?? languages[0],
  );
  const [cache, setCache] = useState<Record<string, TranslationsResponse>>({});
  const [editsByLang, setEditsByLang] = useState<Record<string, FieldEdits>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = (code: LanguageCode) => tName(code.toUpperCase());

  // Load every target language once when the modal opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setActiveLanguage(initialLanguage ?? languages[0]);
    setLoading(true);
    setError(null);
    Promise.all(languages.map((l) => LanguagesService.getTranslations(l, serviceId)))
      .then((responses) => {
        if (cancelled) return;
        const nextCache: Record<string, TranslationsResponse> = {};
        const nextEdits: Record<string, FieldEdits> = {};
        languages.forEach((l, i) => {
          nextCache[l] = responses[i];
          nextEdits[l] = toEdits(responses[i]);
        });
        setCache(nextCache);
        setEditsByLang(nextEdits);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, serviceId, languages, initialLanguage]);

  const activeData = cache[activeLanguage];
  const activeEdits = editsByLang[activeLanguage] ?? {};

  const progressFor = useCallback(
    (code: LanguageCode) => {
      const data = cache[code];
      const edits = editsByLang[code];
      if (!data) return { done: 0, total: 0 };
      const total = data.services.length * 2;
      let done = 0;
      for (const s of data.services) {
        const e = edits?.[s.serviceId];
        if (e?.name.trim()) done += 1;
        if (e?.description.trim()) done += 1;
      }
      return { done, total };
    },
    [cache, editsByLang],
  );

  const setField = (
    serviceIdKey: string,
    field: "name" | "description",
    value: string,
  ) => {
    setEditsByLang((prev) => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [serviceIdKey]: {
          ...prev[activeLanguage]?.[serviceIdKey],
          [field]: value,
        },
      },
    }));
  };

  const hasChanges = useMemo(() => {
    for (const code of languages) {
      const data = cache[code];
      const edits = editsByLang[code];
      if (!data || !edits) continue;
      for (const s of data.services) {
        const e = edits[s.serviceId];
        if (!e) continue;
        if (e.name !== (s.name ?? "") || e.description !== (s.description ?? "")) {
          return true;
        }
      }
    }
    return false;
  }, [languages, cache, editsByLang]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const code of languages) {
        const data = cache[code];
        const edits = editsByLang[code];
        if (!data || !edits) continue;
        const changed = data.services
          .filter((s) => {
            const e = edits[s.serviceId];
            return e && (e.name !== (s.name ?? "") || e.description !== (s.description ?? ""));
          })
          .map((s) => ({
            serviceId: s.serviceId,
            name: edits[s.serviceId].name,
            description: edits[s.serviceId].description,
          }));
        if (changed.length > 0) {
          await LanguagesService.saveTranslations(code, changed);
        }
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const status = (value: string) =>
    value.trim() ? (
      <span className="inline-block rounded-md bg-[#F5F5F5] px-2 py-0.5 text-xs font-semibold text-[#0A0A0A]">
        {t("MODAL.DONE")}
      </span>
    ) : (
      <span className="inline-block rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-900">
        {t("MODAL.MISSING")}
      </span>
    );

  const COLS = "grid grid-cols-[1fr_1fr_120px]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-6 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("MODAL.TITLE")}
          </DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
          {/* Left: language selector with progress */}
          <div className="w-[216px] shrink-0 border-r border-border">
            <div className="border-b border-border px-4 py-3 text-sm text-gray-500">
              {t("MODAL.LANGUAGES_COLUMN")}
            </div>
            <div className="p-2">
              {languages.map((code) => {
                const p = progressFor(code);
                const active = code === activeLanguage;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActiveLanguage(code)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                      active ? "bg-gray-100 font-medium text-[#0A0A0A]" : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{name(code)}</span>
                    <span
                      className={`text-xs font-semibold ${
                        p.done < p.total ? "text-orange-900" : "text-gray-500"
                      }`}
                    >
                      {t("MODAL.PROGRESS", { done: p.done, total: p.total })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: source / target / status */}
          <div className="max-h-[60vh] flex-1 overflow-y-auto">
            {/* Column header (stays fixed while the rows scroll) */}
            <div
              className={`${COLS} sticky top-0 z-10 border-b border-border bg-background text-sm text-gray-500`}
            >
              <span className="px-4 py-3">
                {activeData ? name(activeData.defaultLanguage) : ""}
              </span>
              <span className="border-l border-border px-4 py-3">{name(activeLanguage)}</span>
              <span className="border-l border-border px-4 py-3">
                {t("MODAL.STATUS_COLUMN")}
              </span>
            </div>

            {loading || !activeData ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              activeData.services.map((s) => {
                const e = activeEdits[s.serviceId] ?? { name: "", description: "" };
                return (
                  <div key={s.serviceId}>
                    {/* Service group header */}
                    <div className="flex items-center gap-2 border-b border-border bg-[#F7F7F7] px-4 py-2 text-sm font-semibold text-[#0A0A0A]">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {s.sourceName}
                    </div>

                    {/* Name row */}
                    <div className={`${COLS} border-b border-border`}>
                      <p className="px-4 py-3 text-sm leading-6 text-gray-600">
                        {s.sourceName}
                      </p>
                      <div className="border-l border-border px-4 py-3">
                        <input
                          value={e.name}
                          maxLength={255}
                          placeholder={t("MODAL.SERVICE_NAME_PLACEHOLDER")}
                          onChange={(ev) => setField(s.serviceId, "name", ev.target.value)}
                          className="w-full border-0 bg-transparent p-0 text-sm leading-6 text-[#0A0A0A] placeholder:text-gray-400 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <div className="border-l border-border px-4 py-3">{status(e.name)}</div>
                    </div>

                    {/* Description row */}
                    <div className={`${COLS} border-b border-border`}>
                      <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-6 text-gray-600">
                        {s.sourceDescription}
                      </p>
                      <div className="border-l border-border px-4 py-3">
                        <AutoTextarea
                          value={e.description}
                          maxLength={500}
                          placeholder={t("MODAL.DESCRIPTION_PLACEHOLDER")}
                          onChange={(v) => setField(s.serviceId, "description", v)}
                        />
                      </div>
                      <div className="border-l border-border px-4 py-3">
                        {status(e.description)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("MODAL.CANCEL")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/90"
          >
            {t("MODAL.SAVE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

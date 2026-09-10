"use client";

import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./onboarding-tour.css";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";

type PopoverSide = "top" | "right" | "bottom" | "left";

const storageKey = (userId: string) => `dashboard_onboarding_completed_${userId}`;

/**
 * Runs the guided dashboard tour (driver.js) once for a new user, the first time
 * they land on the overview. A localStorage flag (per user) makes sure it never
 * shows again. `enabled` should be true once the overview content (KPIs/chart)
 * is rendered so every step target exists.
 *
 * `onResolved` is called once the tour is out of the way — whether it finished,
 * was dismissed, or had already been seen before — so the caller can chain the
 * next first-run step (e.g. the profile-setup modal) after it.
 */
export function useOnboardingTour(enabled: boolean, onResolved?: () => void) {
  const { t } = useTranslation("DASHBOARD");
  const { user, loading } = useUserContext();
  const hasRunRef = useRef(false);
  // Keep the latest callback without making it an effect dependency (an inline
  // callback would otherwise re-run the effect and tear down a running tour).
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  useEffect(() => {
    if (!enabled || loading || !user?.userId || hasRunRef.current) return;

    const key = storageKey(user.userId);
    if (localStorage.getItem(key)) {
      // Already seen: nothing to show, but let the caller proceed.
      hasRunRef.current = true;
      onResolvedRef.current?.();
      return;
    }

    hasRunRef.current = true;

    const step = (
      title: string,
      description: string,
      element?: string,
      side?: PopoverSide,
    ): DriveStep => ({
      element,
      popover: {
        title,
        description,
        ...(side ? { side, align: "start" as const } : {}),
      },
    });

    const steps: DriveStep[] = [
      // Centered welcome (no element).
      step(t("ONBOARDING.WELCOME.TITLE"), t("ONBOARDING.WELCOME.DESCRIPTION")),
      step(
        t("ONBOARDING.NAV_DASHBOARD.TITLE"),
        t("ONBOARDING.NAV_DASHBOARD.DESCRIPTION"),
        '[data-tour="nav-dashboard"]',
        "right",
      ),
      step(
        t("ONBOARDING.NAV_SERVICES.TITLE"),
        t("ONBOARDING.NAV_SERVICES.DESCRIPTION"),
        '[data-tour="nav-services"]',
        "right",
      ),
      step(
        t("ONBOARDING.NAV_MEMBERS.TITLE"),
        t("ONBOARDING.NAV_MEMBERS.DESCRIPTION"),
        '[data-tour="nav-members"]',
        "right",
      ),
      step(
        t("ONBOARDING.NAV_SETTINGS.TITLE"),
        t("ONBOARDING.NAV_SETTINGS.DESCRIPTION"),
        '[data-tour="nav-settings"]',
        "right",
      ),
      step(
        t("ONBOARDING.KPIS.TITLE"),
        t("ONBOARDING.KPIS.DESCRIPTION"),
        '[data-tour="kpis"]',
        "bottom",
      ),
      step(t("ONBOARDING.DONE.TITLE"), t("ONBOARDING.DONE.DESCRIPTION")),
    ];

    // Only keep steps whose target exists (defensive: e.g. layout differences).
    const availableSteps = steps.filter(
      (s) => !s.element || document.querySelector(s.element as string),
    );

    const markCompleted = () => {
      try {
        localStorage.setItem(key, "true");
      } catch {
        // ignore storage errors
      }
    };

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.6,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "maturoscope-tour",
      nextBtnText: t("ONBOARDING.BUTTONS.NEXT"),
      prevBtnText: t("ONBOARDING.BUTTONS.PREV"),
      doneBtnText: t("ONBOARDING.BUTTONS.DONE"),
      steps: availableSteps,
      // Fires when the tour finishes or is dismissed — mark as seen either way
      // and let the caller run whatever comes next.
      onDestroyed: () => {
        markCompleted();
        onResolvedRef.current?.();
      },
    });

    driverObj.drive();

    return () => {
      driverObj.destroy();
    };
  }, [enabled, loading, user, t]);
}

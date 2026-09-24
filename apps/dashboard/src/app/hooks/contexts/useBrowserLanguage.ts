"use client";

// NextJS
import { useEffect, useState } from "react";

// State
import constate from "constate";

// Translations
import i18n from "@/app/languages/i18n";

export const DefaultBrowserLanguageState = "EN";

const STORED_LANGUAGE_KEY = "SELECTED_LANGUAGE";

// Supported base language codes (uppercase). Regional variants (e.g. "ES-MX")
// are normalized to their base by prefix.
const SUPPORTED_LANGUAGES = ["EN", "FR", "ES", "IT", "SL", "EL"];

const normalizeLanguage = (value: string | null | undefined): string => {
  if (!value) return DefaultBrowserLanguageState;
  const upper = value.toUpperCase();
  return (
    SUPPORTED_LANGUAGES.find((code) => upper.startsWith(code)) ??
    DefaultBrowserLanguageState
  );
};

const useBrowserLanguage = () => {
  const [browserLanguage, setBrowserLanguage] = useState<string>("EN");
  const [isInitialized, setIsInitialized] = useState(false);

  const handleBrowserLanguage = (language: string) => {
    setBrowserLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem(STORED_LANGUAGE_KEY, language);
  };

  const resetBrowserLanguageState = () =>
    setBrowserLanguage(DefaultBrowserLanguageState);

  useEffect(() => {
    if (isInitialized) return;
    
    const savedLanguage = localStorage.getItem(STORED_LANGUAGE_KEY);

    if (savedLanguage) {
      handleBrowserLanguage(normalizeLanguage(savedLanguage));
      setIsInitialized(true);
      return;
    }

    handleBrowserLanguage(normalizeLanguage(window.navigator.language));
    setIsInitialized(true);
  }, [isInitialized]);

  return { browserLanguage, handleBrowserLanguage, resetBrowserLanguageState };
};

const [BrowserLanguageProvider, useBrowserLanguageState] =
  constate(useBrowserLanguage);

export { BrowserLanguageProvider, useBrowserLanguageState };

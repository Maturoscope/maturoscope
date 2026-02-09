"use client";

// NextJS
import { useEffect, useState } from "react";

// State
import constate from "constate";

// Translations
import i18n from "@/app/languages/i18n";

export const DefaultBrowserLanguageState = "EN";

const STORED_LANGUAGE_KEY = "SELECTED_LANGUAGE";

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

    let normalizedSavedLanguage = savedLanguage;
    if (savedLanguage) {
      if (savedLanguage.startsWith("EN")) {
        normalizedSavedLanguage = "EN";
      } else if (savedLanguage.startsWith("FR")) {
        normalizedSavedLanguage = "FR";
      } else {
        normalizedSavedLanguage = DefaultBrowserLanguageState;
      }
    }
    
    if (normalizedSavedLanguage && (normalizedSavedLanguage === "EN" || normalizedSavedLanguage === "FR")) {
      handleBrowserLanguage(normalizedSavedLanguage);
      setIsInitialized(true);
      return;
    }
    
    let detectedLanguage: string = DefaultBrowserLanguageState;
    const browserLang = String(window.navigator.language).toUpperCase();
    
    if (browserLang.startsWith("EN")) {
      detectedLanguage = "EN";
    } else if (browserLang.startsWith("FR")) {
      detectedLanguage = "FR";
    } else {
      detectedLanguage = DefaultBrowserLanguageState;
    }
    
    handleBrowserLanguage(detectedLanguage);
    setIsInitialized(true);
  }, [isInitialized]);

  return { browserLanguage, handleBrowserLanguage, resetBrowserLanguageState };
};

const [BrowserLanguageProvider, useBrowserLanguageState] =
  constate(useBrowserLanguage);

export { BrowserLanguageProvider, useBrowserLanguageState };

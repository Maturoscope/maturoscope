// Translations
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import EN from "./en.json";
import FR from "./fr.json";
import ES from "./es.json";
import IT from "./it.json";
import SL from "./sl.json";
import EL from "./el.json";

const englishVariants = {
  EN,
  "EN-GB": EN,
  "EN-US": EN,
  "EN-AU": EN,
  "EN-CA": EN,
  "EN-NZ": EN,
  "EN-IN": EN,
  "EN-IE": EN,
};

const frenchVariants = {
  FR,
  "FR-FR": FR,
  "FR-CA": FR,
  "FR-BE": FR,
  "FR-CH": FR,
  "FR-LU": FR,
  "FR-MC": FR,
};

const spanishVariants = {
  ES,
  "ES-ES": ES,
  "ES-MX": ES,
  "ES-AR": ES,
  "ES-CO": ES,
  "ES-CL": ES,
};

const italianVariants = {
  IT,
  "IT-IT": IT,
  "IT-CH": IT,
};

const slovenianVariants = {
  SL,
  "SL-SI": SL,
};

const greekVariants = {
  EL,
  "EL-GR": EL,
  "EL-CY": EL,
};

const resources = {
  ...englishVariants,
  ...frenchVariants,
  ...spanishVariants,
  ...italianVariants,
  ...slovenianVariants,
  ...greekVariants,
  };

export const enum Language {
  EN = "EN",
  FR = "FR",
  ES = "ES",
  IT = "IT",
  SL = "SL",
  EL = "EL",
}

export const dropdownLanguageList = [
  {
    key: Language.EN,
    label: "English",
  },
  {
    key: Language.FR,
    label: "French",
  },
  {
    key: Language.ES,
    label: "Spanish",
  },
  {
    key: Language.IT,
    label: "Italian",
  },
  {
    key: Language.SL,
    label: "Slovenian",
  },
  {
    key: Language.EL,
    label: "Greek",
  },
];

i18n.use(initReactI18next).init({
  resources,
  lng: "EN",
  fallbackLng: "EN",
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
  returnNull: false,
  returnObjects: false,
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`Missing translation key: ${key} in namespace: ${ns} for language: ${lng}`);
  },
});

export default i18n;

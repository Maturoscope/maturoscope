"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Hooks
import { useBrowserLanguageState } from "@/app/hooks/contexts/useBrowserLanguage";

// Components

// Utils
import { LANGUAGES } from "./data";
import LanguageSelector from "./LanguajeSelector";

export function LanguageButton() {
  const [isOpenDialog, setOpenDialog] = useState(false);
  const { browserLanguage } = useBrowserLanguageState();
  const { t } = useTranslation("LANGUAJES");
  const currentLanguage =
    LANGUAGES.find((lang) => lang.key === browserLanguage) || LANGUAGES[0];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpenDialog(!isOpenDialog)}
        className="flex items-center justify-center rounded-md border border-[#e5e5e5] bg-white px-4 py-2 h-9 gap-2 text-black hover:bg-gray-50 transition-colors"
        whileTap={{ scale: 0.98 }}
        aria-haspopup="dialog"
        aria-expanded={isOpenDialog}
      >
        <Image
          src={currentLanguage.src || "/placeholder.svg"}
          alt={`${t(currentLanguage.key)} flag`}
          width={16}
          height={16}
          className="object-cover"
        />
        <span className="text-sm text-gray-700 font-medium">{currentLanguage.key}</span>
        <motion.div
          animate={{ rotate: isOpenDialog ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </motion.div>
      </motion.button>

      <LanguageSelector
        isOpenDialog={isOpenDialog}
        setOpenDialog={setOpenDialog}
      />
    </div>
  );
}

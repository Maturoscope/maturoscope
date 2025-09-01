"use client";

import { useState } from "react";
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
    <div className="relative rounded-md border border-[#e5e5e5] bg-white">
      <motion.button
        onClick={() => setOpenDialog(!isOpenDialog)}
        className="flex items-center rounded px-4 py-2 h-9 w-[100px] gap-1 text-black "
        whileTap={{ scale: 0.98 }}
        aria-haspopup="dialog"
        aria-expanded={isOpenDialog}
      >
        <div className="h-[24px] w-[100px] flex flex-row items-center">
          <Image
            src={currentLanguage.src || "/placeholder.svg"}
            alt={`${t(currentLanguage.key)} flag`}
            width={24}
            height={24}
            className="object-cover w-full h-full"
          />
          
        </div>
        <p className="text-sm md:text-base text-black font-medium">{currentLanguage.key}</p>
        <motion.div
          animate={{ rotate: isOpenDialog ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <LanguageSelector
        isOpenDialog={isOpenDialog}
        setOpenDialog={setOpenDialog}
      />
    </div>
  );
}

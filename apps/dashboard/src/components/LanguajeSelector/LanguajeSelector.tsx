"use client";

// NextJS
import type React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// Hooks
import { useBrowserLanguageState } from "@/app/hooks/contexts/useBrowserLanguage";

// Utils
import { LANGUAGES } from "./data";
import { Check } from "lucide-react";

// Types
interface DialogsProps {
  isOpenDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const LanguageSelector: React.FC<DialogsProps> = ({
  isOpenDialog,
  setOpenDialog,
}) => {
  const { browserLanguage, handleBrowserLanguage } = useBrowserLanguageState();
  const { t } = useTranslation("LANGUAJES");

  const handleClick = (key: string) => {
    handleBrowserLanguage(key);
    setOpenDialog(!isOpenDialog);
  };

  return (
    <AnimatePresence>
      {isOpenDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-[5vh] pb-3 right-[0px] flex flex-col w-[224px] bottom-[calc(33%-65px)]  bg-white  text-lg z-10 rounded-md backdrop-blur-[100px] 
          lg:right-[-121px] lg:top-[5vh] lg:bottom-0 border-[1px] h-[130px] border-[#E6E6E6] gap-1"
        >
          {LANGUAGES.map(({ key, src }) => {
            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => {
                  handleClick(key);
                }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col min-w-[65px] h-[32px] pt-2"
                disabled={key === "TITLE"}
              >
                <div className="flex flex-row gap-1  items-center min-h-[32px]">
                  {key === "TITLE" ? (
                    <p className="text-sm md:text-base text-black font-bold px-5">
                      {t(key)}
                    </p>
                  ) : (
                    <div className="flex flex-row gap-1  items-center justify-between w-full px-5">
                      <div className="flex flex-row gap-1  items-center">
                        <div className="h-[24px] w-[24px]">
                          <Image
                            alt="Language icons"
                            src={src || "/placeholder.svg"}
                            className="object-fill w-full h-full"
                          />
                        </div>
                        <p className="text-sm md:text-base text-black font-medium pl-1">
                          {t(key)}
                        </p>
                      </div>
                      <div>
                      {key === browserLanguage && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageSelector;

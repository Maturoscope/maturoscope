"use client"

// Packages
import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
// Components
import PrivacyPolicyModal from "@/components/common/PrivacyPolicyModal/PrivacyPolicyModal"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"
// Types
import { Locale } from "@/dictionaries/dictionaries"

export interface GdprModalProps {
  message: string
  learnMoreLabel: string
  lang: Locale
  privacyPolicyModal: {
    title: string
    lastUpdatedLabel: string
  }
}

const GdprModal = ({ message, learnMoreLabel, lang, privacyPolicyModal }: GdprModalProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false)

  const handleLearnMoreClick = () => {
    setIsPrivacyPolicyOpen(true)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={SIMPLE_FADE_VARIANT}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-10px)] lg:w-[655px] md:left-4 md:bottom-[120px] md:translate-x-0 "
          >
            <div className="bg-white px-4 py-3 rounded-lg flex items-start gap-3 border border-border">
              <Image
                src="/icons/homepage/cookie.svg"
                alt="Cookie"
                width={16}
                height={18}
                className="shrink-0 mt-0.5"
              />

              <p className="text-sm font-medium text-foreground flex-1">
                {message}
                <button
                  onClick={handleLearnMoreClick}
                  className="ml-1 text-accent font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  {learnMoreLabel}
                </button>
              </p>

              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer size-4 flex items-center justify-center hover:bg-neutral-100 rounded-sm transition-all duration-200 shrink-0 bg-transparent border-none p-0"
              >
                <Image
                  src="/icons/common/cross.svg"
                  alt="Close"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        setIsOpen={setIsPrivacyPolicyOpen}
        lang={lang}
        title={privacyPolicyModal.title}
        lastUpdatedLabel={privacyPolicyModal.lastUpdatedLabel}
      />
    </>
  )
}

export default GdprModal

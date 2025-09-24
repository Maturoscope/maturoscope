"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'

// Language options with flags
const LANGUAGES = [
  { key: 'TITLE', src: null },
  { key: 'EN', src: '/icons/EN.svg' },
  { key: 'FR', src: '/icons/FR.svg' },
]

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function LanguageSelector({
  value,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}: LanguageSelectorProps) {
  const { t: tl } = useTranslation('LANGUAJES')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLanguageSelect = (languageKey: string) => {
    if (languageKey !== 'TITLE') {
      onChange(languageKey)
      setIsDropdownOpen(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="language">{label}</Label>
      )}
      
      <div className="relative rounded-md border border-[#e5e5e5] max-w-[228px]">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center rounded px-4 py-2 h-9 w-[228px] gap-1 text-black"
          whileTap={{ scale: 0.98 }}
          aria-haspopup="dialog"
          aria-expanded={isDropdownOpen}
          disabled={disabled}
          type="button"
        >
          <div className="h-[18px] w-[24px] flex flex-row items-center">
            <Image
              src={LANGUAGES.find(lang => lang.key === value)?.src || LANGUAGES[1].src || ""}
              alt={`${value} flag`}
              width={24}
              height={24}
              className="object-cover w-full h-full"
            />
          </div>
          <p className="text-sm md:text-base text-black font-medium">{value}</p>
          <motion.div
            className="ml-auto"
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute top-[5vh] pb-3 right-[0px] flex flex-col w-[224px] bottom-[calc(33%-65px)] bg-white text-lg z-10 rounded-md backdrop-blur-[100px] 
               lg:top-[5vh] lg:bottom-0 border-[1px] h-[130px] border-[#E6E6E6] gap-1"
            >
              {LANGUAGES.map(({ key, src }) => {
                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => handleLanguageSelect(key)}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col min-w-[65px] h-[32px] pt-2"
                    disabled={key === "TITLE"}
                  >
                    <div className="flex flex-row gap-1 items-center min-h-[32px]">
                      {key === "TITLE" ? (
                        <p className="text-sm md:text-base text-black font-bold px-5">
                          {tl(`${key}`)}
                        </p>
                      ) : (
                        <div className="flex flex-row gap-1 items-center justify-between w-full px-5">
                          <div className="flex flex-row gap-1 items-center">
                            <div className="h-[24px] w-[24px]">
                              <Image
                                alt="Language icons"
                                src={src || "/placeholder.svg"}
                                width={24}
                                height={24}
                                className="object-fill w-full h-full"
                              />
                            </div>
                            <p className="text-sm md:text-base text-black font-medium pl-1">
                              {tl(`${key}`)}
                            </p>
                          </div>
                          <div>
                            {key === value && <Check className="w-4 h-4" />}
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
      </div>

      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  )
}

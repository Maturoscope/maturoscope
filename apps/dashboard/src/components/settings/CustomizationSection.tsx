import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { LANGUAGES } from '@/components/LanguajeSelector/data'
import { CustomizationFormData } from './useSettingsState'

interface CustomizationSectionProps {
  form: CustomizationFormData
  setForm: React.Dispatch<React.SetStateAction<CustomizationFormData>>
  errors: {[key: string]: string}
  isUpdating: boolean
  hasChanges: boolean
  onSubmit: (e: React.FormEvent) => void
  t: (key: string) => string
  tl: (key: string) => string
}

export function CustomizationSection({
  form,
  setForm,
  errors,
  isUpdating,
  hasChanges,
  onSubmit,
  t,
  tl
}: CustomizationSectionProps) {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('CUSTOMIZATION.TITLE')}</h2>
      </div>
      
      <Separator />
      
      <form onSubmit={onSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {errors.general}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="language">{t('CUSTOMIZATION.LANGUAGE')}</Label>
          <div className="relative rounded-md border border-[#e5e5e5] max-w-[228px]">
            <motion.button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center rounded px-4 py-2 h-9 w-[228px] gap-1 text-black"
              whileTap={{ scale: 0.98 }}
              aria-haspopup="dialog"
              aria-expanded={isLanguageDropdownOpen}
              disabled={isUpdating}
              type="button"
            >
              <div className="h-[18px] w-[24px] flex flex-row items-center">
                <Image
                  src={LANGUAGES.find(lang => lang.key === form.language)?.src || LANGUAGES[1].src}
                  alt={`${form.language} flag`}
                  width={24}
                  height={24}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-sm md:text-base text-black font-medium">{form.language}</p>
              <motion.div
                className="ml-auto"
                animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isLanguageDropdownOpen && (
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
                        onClick={() => {
                          if (key !== 'TITLE') {
                            setForm(prev => ({ ...prev, language: key }))
                            setIsLanguageDropdownOpen(false)
                          }
                        }}
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
                                    className="object-fill w-full h-full"
                                  />
                                </div>
                                <p className="text-sm md:text-base text-black font-medium pl-1">
                                  {tl(`${key}`)}
                                </p>
                              </div>
                              <div>
                                {key === form.language && <Check className="w-4 h-4" />}
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
          <p className="text-sm text-gray-500">
            {t('CUSTOMIZATION.LANGUAGE_DESCRIPTION')}
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto sm:min-w-[150px]" 
          disabled={isUpdating || !hasChanges}
        >
          {isUpdating ? <Loader2 className="size-4 animate-spin" /> : t('CUSTOMIZATION.UPDATE_CUSTOMIZATION')}
        </Button>
      </form>
    </div>
  )
}

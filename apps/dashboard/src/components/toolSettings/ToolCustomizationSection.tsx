import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageSelector } from '@/components/ui/language-selector'
import { ToolCustomizationFormData, ToolLanguageFormData } from './useToolSettingsState'
import { Separator } from '@/components/ui/separator'

interface ToolCustomizationSectionProps {
  customizationForm: ToolCustomizationFormData
  setCustomizationForm: React.Dispatch<React.SetStateAction<ToolCustomizationFormData>>
  languageForm: ToolLanguageFormData
  setLanguageForm: React.Dispatch<React.SetStateAction<ToolLanguageFormData>>
  errors: { [key: string]: string }
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isUpdating: boolean
  hasChanges: boolean
  onSaveAll: (signatureToRemove?: boolean) => Promise<void>
}

export function ToolCustomizationSection({
  customizationForm,
  setCustomizationForm,
  languageForm,
  setLanguageForm,
  errors,
  setErrors,
  isUpdating,
  hasChanges,
  onSaveAll,
}: ToolCustomizationSectionProps) {
  const { t } = useTranslation('TOOL_SETTINGS')

  const handleCustomizationChange = (field: keyof ToolCustomizationFormData, value: string) => {
    setCustomizationForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLanguageChange = (field: keyof ToolLanguageFormData, value: string) => {
    setLanguageForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSaveAll = async () => {
    await onSaveAll(false)
  }

  const fontOptions = [
    { value: 'geist', label: 'Geist' },
    { value: 'open-sans', label: 'Open Sans' },
    { value: 'inter', label: 'Inter' },
    { value: 'poppins', label: 'Poppins' },
  ]

  const themeOptions = [
    { value: 'default', label: 'Default', color: '#000000' },
    { value: 'orange', label: 'Orange', color: '#C2410C' },
    { value: 'blue', label: 'Blue', color: '#1E40AF' },
    { value: 'green', label: 'Green', color: '#166534' },
    { value: 'pink', label: 'Pink', color: '#9D174D' },
    { value: 'violet', label: 'Violet', color: '#5B21B6' },
  ]


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('SECTIONS.CUSTOMIZATION')}</h2>
      </div>

      <Separator />
      <div className="space-y-6">
        {/* Font Selection */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="font">{t('CUSTOMIZATION.FONT.LABEL')}</Label>
          <Select
            value={customizationForm.font}
            onValueChange={(value: string) => handleCustomizationChange('font', value)}
          >
            <SelectTrigger className="max-w-[228px]">
              <SelectValue placeholder={t('CUSTOMIZATION.FONT.PLACEHOLDER')}>
                {fontOptions.find(opt => opt.value === customizationForm.font)?.label || customizationForm.font}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            {t('CUSTOMIZATION.FONT.DESCRIPTION')}
          </p>
          {errors.font && (
            <p className="text-sm text-red-600">{errors.font}</p>
          )}
        </div>

        {/* Theme Selection */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="theme">{t('CUSTOMIZATION.THEME.LABEL')}</Label>
          <Select
            value={customizationForm.theme}
            onValueChange={(value: string) => handleCustomizationChange('theme', value)}
          >
            <SelectTrigger className="max-w-[228px]">
              <SelectValue placeholder={t('CUSTOMIZATION.THEME.PLACEHOLDER')}>
                {(() => {
                  const selectedTheme = themeOptions.find(opt => opt.value === customizationForm.theme)
                  return selectedTheme ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: selectedTheme.color }}
                      />
                      <span>{selectedTheme.label}</span>
                    </div>
                  ) : customizationForm.theme
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[228px]">
              {themeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: option.color }}
                    />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            {t('CUSTOMIZATION.THEME.DESCRIPTION')}
          </p>
          {errors.theme && (
            <p className="text-sm text-red-600">{errors.theme}</p>
          )}
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <LanguageSelector
            value={languageForm.language}
            onChange={(value) => handleLanguageChange('language', value)}
            label={t('LANGUAGE.LABEL')}
            description={t('LANGUAGE.DESCRIPTION')}
            disabled={isUpdating}
          />
          {errors.language && (
            <p className="text-sm text-red-600">{errors.language}</p>
          )}
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-start">
          <Button
            onClick={handleSaveAll}
            disabled={!hasChanges || isUpdating}
            className="px-6"
          >
            {isUpdating ? t('CUSTOMIZATION.SAVING') : t('CUSTOMIZATION.UPDATE_BUTTON')}
          </Button>
        </div>
      </div>
    </div>
  )
}

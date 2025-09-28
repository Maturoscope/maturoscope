import React, { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageSelector } from '@/components/ui/language-selector'
import { ToolCustomizationFormData, ToolPDFSignatureFormData, ToolLanguageFormData } from './useToolSettingsState'
import Image from 'next/image'
import { useImageVersion } from '@/hooks/useImageVersion'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ToolCustomizationSectionProps {
  customizationForm: ToolCustomizationFormData
  setCustomizationForm: React.Dispatch<React.SetStateAction<ToolCustomizationFormData>>
  pdfSignatureForm: ToolPDFSignatureFormData
  setPDFSignatureForm: React.Dispatch<React.SetStateAction<ToolPDFSignatureFormData>>
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
  pdfSignatureForm,
  setPDFSignatureForm,
  languageForm,
  setLanguageForm,
  errors,
  setErrors,
  isUpdating,
  hasChanges,
  onSaveAll,
}: ToolCustomizationSectionProps) {
  const { t } = useTranslation('TOOL_SETTINGS')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(pdfSignatureForm.signatureUrl || null)
  const [showRemoveSignatureDialog, setShowRemoveSignatureDialog] = useState(false)
  const [signatureToRemove, setSignatureToRemove] = useState(false)
  // Use the custom hook for signature versioning
  const { updateVersion: updateSignatureVersion, getVersionedUrl } = useImageVersion({
    storageKey: 'signatureVersion',
    eventName: 'signatureUpdated'
  });

  useEffect(() => {
    setPreviewUrl(pdfSignatureForm.signatureUrl || null)
    setSignatureToRemove(false)
    if (pdfSignatureForm.signatureUrl) {
      updateSignatureVersion()
    }
  }, [pdfSignatureForm.signatureUrl, updateSignatureVersion])

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        signature: t('PDF_SIGNATURE.ERRORS.INVALID_TYPE')
      }))
      return
    }

    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        signature: t('PDF_SIGNATURE.ERRORS.FILE_TOO_LARGE')
      }))
      return
    }

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.signature
      return newErrors
    })
    setSignatureToRemove(false)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    setPDFSignatureForm(prev => ({
      ...prev,
      signatureFile: file,
      signatureUrl: url
    }))
  }

  const handleRemoveSignature = () => {
    setShowRemoveSignatureDialog(true)
  }

  const confirmRemoveSignature = () => {
    setSignatureToRemove(true)
    setShowRemoveSignatureDialog(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSaveAll = async () => {
    await onSaveAll(signatureToRemove)
  }

  const fontOptions = [
    { value: 'Geist', label: 'Geist' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
  ]

  const themeOptions = [
    { value: 'Default', label: 'Default' },
    { value: 'Dark', label: 'Dark' },
    { value: 'Light', label: 'Light' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Green', label: 'Green' },
  ]


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('SECTIONS.CUSTOMIZATION')}</h2>
        <Button
          onClick={() => {
            const endUserUrl = process.env.NEXT_PUBLIC_END_USER_URL;
            if (!endUserUrl) {
              console.error('NEXT_PUBLIC_END_USER_URL environment variable is not configured');
              alert('Preview URL is not configured. Please contact your administrator.');
              return;
            }
            window.open(endUserUrl, '_blank');
          }}
          variant="outline"
          size="sm"
        >
          {t('CUSTOMIZATION.PREVIEW_TOOL')}
        </Button>
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
            <SelectTrigger className="max-w-[228px]" disabled={true}>
              <SelectValue placeholder={t('CUSTOMIZATION.FONT.PLACEHOLDER')} />
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
            <SelectTrigger className="max-w-[228px]" disabled={true}>
              <SelectValue placeholder={t('CUSTOMIZATION.THEME.PLACEHOLDER')} />
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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

        {/* PDF Signature Section */}
        <div className="space-y-4">
          <Label>{t('PDF_SIGNATURE.LABEL')}</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={ `w-[240px] h-[102px] ${!previewUrl || signatureToRemove ? 'border-1' : 'border-0'}  border-dashed border-gray-300 rounded-lg flex items-center justify-center relative`}>
                {previewUrl && !signatureToRemove ? (
                  <Image
                    src={getVersionedUrl(previewUrl)}
                    alt="Signature preview"
                    className="max-h-[100px] max-w-[240px] rounded-lg"
                    width={240}
                    height={100}
                    objectFit="cover"
                  />
                ) : (
                  <Upload className="h-4 w-4 text-gray-900" />
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
              >
                {t('PDF_SIGNATURE.UPLOAD_BUTTON')}
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!previewUrl && !pdfSignatureForm.signatureUrl}
              onClick={handleRemoveSignature}
            >
              {t('PDF_SIGNATURE.REMOVE_BUTTON')}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {errors.signature && (
            <p className="text-sm text-red-600">{errors.signature}</p>
          )}

          <p className="text-xs text-gray-900 font-medium">
            {t('PDF_SIGNATURE.REQUIREMENTS')}
          </p>
          <p className="text-xs text-gray-500">
            {t('PDF_SIGNATURE.DESCRIPTION')}
          </p>
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

      {/* Remove Signature Confirmation Dialog */}
      <AlertDialog open={showRemoveSignatureDialog} onOpenChange={setShowRemoveSignatureDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('PDF_SIGNATURE.REMOVE_DIALOG.TITLE')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('PDF_SIGNATURE.REMOVE_DIALOG.DESCRIPTION')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRemoveSignatureDialog(false)}>
              {t('PDF_SIGNATURE.REMOVE_DIALOG.CANCEL')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveSignature}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('PDF_SIGNATURE.REMOVE_DIALOG.CONFIRM')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

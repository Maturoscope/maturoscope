import { ToolCustomizationFormData, ToolPDFSignatureFormData, ToolLanguageFormData } from './useToolSettingsState'
import { OrganizationService } from '@/services/organization.service'

interface UseToolSettingsActionsProps {
  customizationForm: ToolCustomizationFormData
  setOriginalCustomizationForm: React.Dispatch<React.SetStateAction<ToolCustomizationFormData>>
  pdfSignatureForm: ToolPDFSignatureFormData
  setOriginalPDFSignatureForm: React.Dispatch<React.SetStateAction<ToolPDFSignatureFormData>>
  setPDFSignatureForm: React.Dispatch<React.SetStateAction<ToolPDFSignatureFormData>>
  languageForm: ToolLanguageFormData
  setOriginalLanguageForm: React.Dispatch<React.SetStateAction<ToolLanguageFormData>>
  setIsUpdatingCustomization: React.Dispatch<React.SetStateAction<boolean>>
  setIsUpdatingPDFSignature: React.Dispatch<React.SetStateAction<boolean>>
  setIsUpdatingLanguage: React.Dispatch<React.SetStateAction<boolean>>
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>
  setSuccessToastType: React.Dispatch<React.SetStateAction<'customization' | 'pdfSignature' | 'language'>>
  setShowSuccessToast: React.Dispatch<React.SetStateAction<boolean>>
  updateSignatureVersion: () => void
}

export function useToolSettingsActions({
  customizationForm,
  setOriginalCustomizationForm,
  pdfSignatureForm,
  setOriginalPDFSignatureForm,
  setPDFSignatureForm,
  languageForm,
  setOriginalLanguageForm,
  setIsUpdatingCustomization,
  setIsUpdatingPDFSignature,
  setIsUpdatingLanguage,
  setErrors,
  setSuccessToastType,
  setShowSuccessToast,
  updateSignatureVersion
}: UseToolSettingsActionsProps) {
  const handleSaveCustomization = async () => {
    setIsUpdatingCustomization(true)
    setErrors({})

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOriginalCustomizationForm({ ...customizationForm })
    } catch (error) {
      console.error('Error saving customization:', error)
      setErrors({
        general: 'Failed to save customization settings. Please try again.'
      })
    } finally {
      setIsUpdatingCustomization(false)
    }
  }

  const handleSavePDFSignature = async (signatureToRemove: boolean = false) => {
    setIsUpdatingPDFSignature(true)
    setErrors({})

    try {
      if (signatureToRemove) {
        await OrganizationService.removeSignature()
        const updatedForm = {
          signatureFile: null,
          signatureUrl: ''
        }
        setOriginalPDFSignatureForm(updatedForm)
        setPDFSignatureForm(updatedForm)
        updateSignatureVersion()
      } else if (pdfSignatureForm.signatureFile) {
        const result = await OrganizationService.uploadSignature(pdfSignatureForm.signatureFile)
        await new Promise(resolve => setTimeout(resolve, 100))
        const updatedForm = {
          signatureFile: null,
          signatureUrl: result.signature
        }
        setOriginalPDFSignatureForm(updatedForm)
        setPDFSignatureForm(updatedForm)
        updateSignatureVersion()
      } else {
        setOriginalPDFSignatureForm({ ...pdfSignatureForm })
      }
    } catch (error) {
      setErrors({
        signature: error instanceof Error ? error.message : 'Failed to save PDF signature. Please try again.'
      })
    } finally {
      setIsUpdatingPDFSignature(false)
    }
  }

  const handleSaveLanguage = async () => {
    setIsUpdatingLanguage(true)
    setErrors({})

    try {
      await OrganizationService.updateLanguage(languageForm.language)
      setOriginalLanguageForm({ ...languageForm })
    } catch (error) {
      console.error('Error saving language:', error)
      setErrors({
        general: 'Failed to save language settings. Please try again.'
      })
    } finally {
      setIsUpdatingLanguage(false)
    }
  }

  const handleSaveAll = async (signatureToRemove: boolean = false) => {
    setIsUpdatingCustomization(true)
    setIsUpdatingPDFSignature(true)
    setIsUpdatingLanguage(true)
    setErrors({})

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOriginalCustomizationForm({ ...customizationForm })

      if (pdfSignatureForm.signatureFile || signatureToRemove) {
        if (signatureToRemove) {
          await OrganizationService.removeSignature()
          const updatedForm = {
            signatureFile: null,
            signatureUrl: ''
          }
          setOriginalPDFSignatureForm(updatedForm)
          setPDFSignatureForm(updatedForm)
          updateSignatureVersion()
        } else if (pdfSignatureForm.signatureFile) {
          const result = await OrganizationService.uploadSignature(pdfSignatureForm.signatureFile)
          await new Promise(resolve => setTimeout(resolve, 100))
          const updatedForm = {
            signatureFile: null,
            signatureUrl: result.signature
          }
          setOriginalPDFSignatureForm(updatedForm)
          setPDFSignatureForm(updatedForm)
          updateSignatureVersion()
        }
      }

      await OrganizationService.updateLanguage(languageForm.language)
      setOriginalLanguageForm({ ...languageForm })

      setSuccessToastType('customization')
      setShowSuccessToast(true)
      
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 3000)

    } catch (error) {
      console.error('Error saving settings:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to save settings. Please try again.'
      })
    } finally {
      setIsUpdatingCustomization(false)
      setIsUpdatingPDFSignature(false)
      setIsUpdatingLanguage(false)
    }
  }

  return {
    handleSaveCustomization,
    handleSavePDFSignature,
    handleSaveLanguage,
    handleSaveAll,
  }
}

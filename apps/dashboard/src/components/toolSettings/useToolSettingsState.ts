import { useState, useEffect } from 'react'
import { useUserContext } from '@/app/hooks/contexts/UserProvider'
import { useBrowserLanguageState } from '@/app/hooks/contexts/useBrowserLanguage'

export interface ToolCustomizationFormData {
  font: string
  theme: string
}

export interface ToolPDFSignatureFormData {
  signatureFile: File | null
  signatureUrl: string
}

export interface ToolLanguageFormData {
  language: string
}

export function useToolSettingsState() {
  const { user, refetch: refetchUser, updateUser } = useUserContext()
  const { browserLanguage, handleBrowserLanguage } = useBrowserLanguageState()
  
  const [activeSection, setActiveSection] = useState('profile')
  
  // Customization Form
  const [customizationForm, setCustomizationForm] = useState<ToolCustomizationFormData>({
    font: user?.organization?.font || 'Geist',
    theme: user?.organization?.theme === 'Default' ? 'default' : (user?.organization?.theme || 'default')
  })
  
  const [originalCustomizationForm, setOriginalCustomizationForm] = useState<ToolCustomizationFormData>({
    font: user?.organization?.font || 'Geist',
    theme: user?.organization?.theme === 'Default' ? 'default' : (user?.organization?.theme || 'default')
  })
  
  // PDF Signature Form
  const [pdfSignatureForm, setPDFSignatureForm] = useState<ToolPDFSignatureFormData>({
    signatureFile: null,
    signatureUrl: user?.organization?.signature || ''
  })
  
  const [originalPDFSignatureForm, setOriginalPDFSignatureForm] = useState<ToolPDFSignatureFormData>({
    signatureFile: null,
    signatureUrl: user?.organization?.signature || ''
  })
  
  // Language Form
  const [languageForm, setLanguageForm] = useState<ToolLanguageFormData>({
    language: user?.organization?.language || browserLanguage || 'EN'
  })
  
  const [originalLanguageForm, setOriginalLanguageForm] = useState<ToolLanguageFormData>({
    language: user?.organization?.language || browserLanguage || 'EN'
  })
  
  // Update forms when user data changes
  useEffect(() => {
    if (user?.organization) {
      const themeValue = user.organization.theme === 'Default' ? 'default' : (user.organization.theme || 'default')
      const newCustomizationForm = {
        font: user.organization.font || 'Geist',
        theme: themeValue
      }
      const newPDFSignatureForm = {
        signatureFile: null,
        signatureUrl: user.organization.signature || ''
      }
      const newLanguageForm = {
        language: user.organization.language || browserLanguage || 'EN'
      }
      
      setCustomizationForm(newCustomizationForm)
      setOriginalCustomizationForm(newCustomizationForm)
      setPDFSignatureForm(newPDFSignatureForm)
      setOriginalPDFSignatureForm(newPDFSignatureForm)
      setLanguageForm(newLanguageForm)
      setOriginalLanguageForm(newLanguageForm)
    }
  }, [user, browserLanguage])
  
  // Loading states
  const [isUpdatingCustomization, setIsUpdatingCustomization] = useState(false)
  const [isUpdatingPDFSignature, setIsUpdatingPDFSignature] = useState(false)
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false)
  
  // Error and success states
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [hasChanges, setHasChanges] = useState(false)
  
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successToastType, setSuccessToastType] = useState<'customization' | 'pdfSignature' | 'language'>('customization')
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [pendingSection, setPendingSection] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  // Update language form when browser language changes
  useEffect(() => {
    const formData = {
      language: browserLanguage || 'EN'
    }
    setLanguageForm(formData)
    setOriginalLanguageForm(formData)
  }, [browserLanguage])

  // Check for changes whenever form data changes
  useEffect(() => {
    let hasFormChanges = false

    if (activeSection === 'customization') {
      hasFormChanges = 
        customizationForm.font !== originalCustomizationForm.font ||
        customizationForm.theme !== originalCustomizationForm.theme
    } else if (activeSection === 'pdfSignature') {
      hasFormChanges = 
        pdfSignatureForm.signatureFile !== originalPDFSignatureForm.signatureFile ||
        pdfSignatureForm.signatureUrl !== originalPDFSignatureForm.signatureUrl
    } else if (activeSection === 'language') {
      hasFormChanges = 
        languageForm.language !== originalLanguageForm.language
    }
    
    setHasChanges(hasFormChanges)
  }, [activeSection, customizationForm, originalCustomizationForm, pdfSignatureForm, originalPDFSignatureForm, languageForm, originalLanguageForm])

  return {
    activeSection,
    setActiveSection,
    customizationForm,
    setCustomizationForm,
    originalCustomizationForm,
    setOriginalCustomizationForm,
    pdfSignatureForm,
    setPDFSignatureForm,
    originalPDFSignatureForm,
    setOriginalPDFSignatureForm,
    languageForm,
    setLanguageForm,
    originalLanguageForm,
    setOriginalLanguageForm,
    isUpdatingCustomization,
    setIsUpdatingCustomization,
    isUpdatingPDFSignature,
    setIsUpdatingPDFSignature,
    isUpdatingLanguage,
    setIsUpdatingLanguage,
    errors,
    setErrors,
    hasChanges,
    showSuccessToast,
    setShowSuccessToast,
    successToastType,
    setSuccessToastType,
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
    pendingSection,
    setPendingSection,
    pendingNavigation,
    setPendingNavigation,
    user,
    refetchUser,
    updateUser,
    browserLanguage,
    handleBrowserLanguage,
  }
}

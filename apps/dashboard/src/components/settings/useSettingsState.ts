import { useState, useEffect } from 'react'
import { useUserContext } from '@/app/hooks/contexts/UserProvider'
import { useBrowserLanguageState } from '@/app/hooks/contexts/useBrowserLanguage'

export interface ProfileFormData {
  firstName: string
  lastName: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface CustomizationFormData {
  language: string
}

export function useSettingsState() {
  const { user, refetch: refetchUser, updateUser } = useUserContext()
  const { browserLanguage, handleBrowserLanguage } = useBrowserLanguageState()
  
  const [activeSection, setActiveSection] = useState('profile')
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  })
  
  const [originalProfileForm, setOriginalProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  })
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [originalPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [customizationForm, setCustomizationForm] = useState<CustomizationFormData>({
    language: browserLanguage || 'EN'
  })
  
  const [originalCustomizationForm, setOriginalCustomizationForm] = useState<CustomizationFormData>({
    language: browserLanguage || 'EN'
  })
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingCustomization, setIsUpdatingCustomization] = useState(false)
  
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [hasChanges, setHasChanges] = useState(false)
  
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successToastType, setSuccessToastType] = useState<'profile' | 'password' | 'customization'>('profile')
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [pendingSection, setPendingSection] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  // Update profile form when user data loads
  useEffect(() => {
    if (user) {
      const formData = {
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }
      setProfileForm(formData)
      setOriginalProfileForm(formData)
    }
  }, [user])

  // Update customization form when language changes
  useEffect(() => {
    const formData = {
      language: browserLanguage || 'EN'
    }
    setCustomizationForm(formData)
    setOriginalCustomizationForm(formData)
  }, [browserLanguage])

  // Check for changes whenever form data changes
  useEffect(() => {
    let hasFormChanges = false

    if (activeSection === 'profile') {
      hasFormChanges = 
        profileForm.firstName !== originalProfileForm.firstName ||
        profileForm.lastName !== originalProfileForm.lastName
    } else if (activeSection === 'password') {
      hasFormChanges = 
        passwordForm.currentPassword !== originalPasswordForm.currentPassword ||
        passwordForm.newPassword !== originalPasswordForm.newPassword ||
        passwordForm.confirmPassword !== originalPasswordForm.confirmPassword
    } else if (activeSection === 'customization') {
      hasFormChanges = 
        customizationForm.language !== originalCustomizationForm.language
    }
    
    setHasChanges(hasFormChanges)
  }, [activeSection, profileForm, originalProfileForm, passwordForm, originalPasswordForm, customizationForm, originalCustomizationForm])

  return {
    activeSection,
    setActiveSection,
    profileForm,
    setProfileForm,
    originalProfileForm,
    setOriginalProfileForm,
    passwordForm,
    setPasswordForm,
    originalPasswordForm,
    customizationForm,
    setCustomizationForm,
    originalCustomizationForm,
    setOriginalCustomizationForm,
    isUpdatingProfile,
    setIsUpdatingProfile,
    isUpdatingPassword,
    setIsUpdatingPassword,
    isUpdatingCustomization,
    setIsUpdatingCustomization,
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
    handleBrowserLanguage,
  }
}

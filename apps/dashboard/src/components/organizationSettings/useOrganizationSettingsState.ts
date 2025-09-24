import { useState, useEffect } from 'react'
import { useUserContext } from '@/app/hooks/contexts/UserProvider'

export interface OrganizationProfileFormData {
  name: string
  avatarFile: File | null
  avatarUrl: string
  username: string
  email: string
}

export function useOrganizationSettingsState() {
  const { user, refetch: refetchUser, updateUser } = useUserContext()
  
  const [activeSection, setActiveSection] = useState('profile')
  
  // Profile Form
  const [profileForm, setProfileForm] = useState<OrganizationProfileFormData>({
    name: '',
    avatarFile: null,
    avatarUrl: '',
    username: '',
    email: ''
  })
  
  const [originalProfileForm, setOriginalProfileForm] = useState<OrganizationProfileFormData>({
    name: '',
    avatarFile: null,
    avatarUrl: '',
    username: '',
    email: ''
  })
  
  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  
  // Error and success states
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [hasChanges, setHasChanges] = useState(false)
  
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successToastType, setSuccessToastType] = useState<'profile'>('profile')
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [pendingSection, setPendingSection] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  useEffect(() => {
    let hasFormChanges = false

    if (activeSection === 'profile') {
      hasFormChanges = 
        profileForm.name !== originalProfileForm.name ||
        profileForm.avatarFile !== originalProfileForm.avatarFile ||
        profileForm.avatarUrl !== originalProfileForm.avatarUrl ||
        profileForm.username !== originalProfileForm.username ||
        profileForm.email !== originalProfileForm.email
    }
    
    setHasChanges(hasFormChanges)
  }, [activeSection, profileForm, originalProfileForm])

  return {
    activeSection,
    setActiveSection,
    profileForm,
    setProfileForm,
    originalProfileForm,
    setOriginalProfileForm,
    isUpdatingProfile,
    setIsUpdatingProfile,
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
  }
}

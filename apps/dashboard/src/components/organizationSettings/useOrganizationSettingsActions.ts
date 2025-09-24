import { useEffect } from 'react'
import { OrganizationProfileFormData } from './useOrganizationSettingsState'
import { OrganizationService } from '@/services/organization.service'

interface UseOrganizationSettingsActionsProps {
  hasChanges: boolean
  activeSection: string
  profileForm: OrganizationProfileFormData
  setOriginalProfileForm: React.Dispatch<React.SetStateAction<OrganizationProfileFormData>>
  setIsUpdatingProfile: React.Dispatch<React.SetStateAction<boolean>>
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>
  setSuccessToastType: React.Dispatch<React.SetStateAction<'profile'>>
  setShowSuccessToast: React.Dispatch<React.SetStateAction<boolean>>
  setShowUnsavedChangesDialog: React.Dispatch<React.SetStateAction<boolean>>
  setPendingSection: React.Dispatch<React.SetStateAction<string | null>>
  setPendingNavigation: React.Dispatch<React.SetStateAction<(() => void) | null>>
  originalProfileForm: OrganizationProfileFormData
  pendingSection: string | null
  pendingNavigation: (() => void) | null
  user: { email?: string; } | null
  updateUser: (updates: Partial<{ firstName?: string; lastName?: string; name?: string; [key: string]: unknown }>) => void
  t: (key: string) => string
}

export function useOrganizationSettingsActions({
  hasChanges,
  activeSection,
  profileForm,
  setOriginalProfileForm,
  setIsUpdatingProfile,
  setErrors,
  setSuccessToastType,
  setShowSuccessToast,
  t
}: UseOrganizationSettingsActionsProps) {
  

  // Validate organization profile form
  const validateProfileForm = (form: OrganizationProfileFormData) => {
    const errors: { [key: string]: string } = {}

    if (!form.name.trim()) {
      errors.name = t('PROFILE.ERRORS.NAME_REQUIRED')
    } else if (form.name.trim().length < 2) {
      errors.name = t('PROFILE.ERRORS.NAME_MIN_LENGTH')
    }

    if (!form.username.trim()) {
      errors.username = t('PROFILE.ERRORS.USERNAME_REQUIRED')
    } else if (form.username.trim().length < 3) {
      errors.username = t('PROFILE.ERRORS.USERNAME_MIN_LENGTH')
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
      errors.username = t('PROFILE.ERRORS.USERNAME_INVALID')
    }

    if (!form.email.trim()) {
      errors.email = t('PROFILE.ERRORS.EMAIL_REQUIRED')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t('PROFILE.ERRORS.EMAIL_INVALID')
    }

    return errors
  }

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true)
    setErrors({})

    try {
      const validationErrors = validateProfileForm(profileForm)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      // Validate avatar file if provided
      if (profileForm.avatarFile) {
        const maxSize = 4 * 1024 * 1024 // 4MB
        if (profileForm.avatarFile.size > maxSize) {
          throw new Error('Avatar file size exceeds 4MB limit')
        }
        
        const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg']
        if (!allowedTypes.includes(profileForm.avatarFile.type)) {
          throw new Error('Avatar file type not supported. Use SVG, PNG or JPG.')
        }
      }

      // Call real API to update organization profile
      const updateData = {
        name: profileForm.name,
        key: profileForm.username,
        email: profileForm.email
      }
      
      // Update organization profile via API
      await OrganizationService.updateProfile(updateData)
      
      // Handle avatar upload if provided
      if (profileForm.avatarFile) {
        await OrganizationService.uploadAvatar(profileForm.avatarFile)
      }
      
      // Update original form to reflect saved state
      setOriginalProfileForm({ ...profileForm })
      
      // Show success message
      setSuccessToastType('profile')
      setShowSuccessToast(true)
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 3000)
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to save organization profile. Please try again.'
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle saving current section
  const handleSaveCurrentSection = async () => {
    switch (activeSection) {
      case 'profile':
        await handleSaveProfile()
        break
      default:
        break
    }
  }

  // Reset forms for specific section
  const resetFormsForSection = (section: string) => {
    switch (section) {
      case 'profile':
        break
      default:
        break
    }
  }

  // Handle browser navigation
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (hasChanges) {
      event.preventDefault()
      event.returnValue = ''
    }
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasChanges])

  return {
    handleSaveProfile,
    handleSaveCurrentSection,
    resetFormsForSection,
    validateProfileForm,
  }
}

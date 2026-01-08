import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProfileFormData, PasswordFormData, CustomizationFormData } from './useSettingsState'
import { validateProfileForm, validatePasswordForm } from './validations'
import { UserService } from '@/services/user.service'

interface UseSettingsActionsProps {
  hasChanges: boolean
  activeSection: string
  profileForm: ProfileFormData
  setOriginalProfileForm: React.Dispatch<React.SetStateAction<ProfileFormData>>
  passwordForm: PasswordFormData
  customizationForm: CustomizationFormData
  setOriginalCustomizationForm: React.Dispatch<React.SetStateAction<CustomizationFormData>>
  setIsUpdatingProfile: React.Dispatch<React.SetStateAction<boolean>>
  setIsUpdatingPassword: React.Dispatch<React.SetStateAction<boolean>>
  setIsUpdatingCustomization: React.Dispatch<React.SetStateAction<boolean>>
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordFormData>>
  setSuccessToastType: React.Dispatch<React.SetStateAction<'profile' | 'password' | 'customization'>>
  setShowSuccessToast: React.Dispatch<React.SetStateAction<boolean>>
  setShowUnsavedChangesDialog: React.Dispatch<React.SetStateAction<boolean>>
  setPendingSection: React.Dispatch<React.SetStateAction<string | null>>
  setPendingNavigation: React.Dispatch<React.SetStateAction<(() => void) | null>>
  handleBrowserLanguage: (language: string) => void
  originalProfileForm: ProfileFormData
  originalPasswordForm: PasswordFormData
  originalCustomizationForm: CustomizationFormData
  pendingSection: string | null
  pendingNavigation: (() => void) | null
  user: { email?: string; organization?: { email?: string } } | null
  updateUser: (updates: Partial<{ firstName?: string; lastName?: string; name?: string; [key: string]: unknown }>) => void
  t: (key: string) => string
}

export function useSettingsActions({
  hasChanges,
  activeSection,
  profileForm,
  setOriginalProfileForm,
  passwordForm,
  customizationForm,
  setOriginalCustomizationForm,
  setIsUpdatingProfile,
  setIsUpdatingPassword,
  setIsUpdatingCustomization,
  setErrors,
  setPasswordForm,
  setSuccessToastType,
  setShowSuccessToast,
  setShowUnsavedChangesDialog,
  setPendingSection,
  setPendingNavigation,
  handleBrowserLanguage,
  pendingSection,
  pendingNavigation,
  user,
  updateUser,
  t
}: UseSettingsActionsProps) {
  const router = useRouter()

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    if (hasChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasChanges])

  // Intercept navigation clicks when there are unsaved changes
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasChanges) return

      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href) {
        const currentOrigin = window.location.origin
        const linkUrl = new URL(link.href)
        
        if (linkUrl.origin === currentOrigin) {
          e.preventDefault()
          e.stopPropagation()
          
          setPendingNavigation(() => () => {
            router.push(linkUrl.pathname + linkUrl.search + linkUrl.hash)
          })
          setShowUnsavedChangesDialog(true)
        }
      }
    }

    if (hasChanges) {
      document.addEventListener('click', handleClick, true)
    }

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [hasChanges, router, setPendingNavigation, setShowUnsavedChangesDialog])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is the first admin member (email matches organization email)
    const isFirstAdminMember = Boolean(
      user?.email && 
      user?.organization?.email && 
      user.email.toLowerCase() === user.organization.email.toLowerCase()
    )
    
    if (isFirstAdminMember) {
      setErrors({ 
        general: 'Cannot update profile: You are the first admin member of this organization.' 
      })
      return
    }
    
    const validation = validateProfileForm(profileForm, t)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setIsUpdatingProfile(true)
    setErrors({})
    
    try {
      if (!user?.email) {
        throw new Error('User email is required to update profile')
      }
      const userEmail = user.email
      
      const requestUrl = `/api/user/${encodeURIComponent(userEmail)}`
      const requestBody = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName
      }
      
      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Failed to update profile' }
        }
        
        throw new Error(errorData.error || 'Failed to update profile')
      }
      
        setOriginalProfileForm({ ...profileForm })
        
        updateUser({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          name: `${profileForm.firstName} ${profileForm.lastName}`
        })
        
        setSuccessToastType('profile')
        setShowSuccessToast(true)
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' 
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validatePasswordForm(passwordForm, t)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setIsUpdatingPassword(true)
    setErrors({})
    
    try {
      if (!user?.email) {
        throw new Error('User email is required to update password')
      }
      
      // Call the UserService (which now calls Auth0 API) 
      await UserService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setSuccessToastType('password')
      setShowSuccessToast(true)
    } catch (error) {
      console.error('Error updating password:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      
      // Check if it's a current password error and show it in the specific field
      if (errorMessage.includes('Current password is incorrect') || 
          errorMessage.includes('current password') ||
          errorMessage.includes('incorrect password')) {
        setErrors({ 
          currentPassword: t('ERRORS.CURRENT_PASSWORD_INCORRECT') || 'Current password is incorrect'
        })
      } else if (errorMessage.includes('User not found in Auth0')) {
        setErrors({ 
          general: 'There was an issue with your account. Please contact support or try logging out and back in.'
        })
      } else if (errorMessage.includes('insufficient_scope') || errorMessage.includes('Forbidden')) {
        setErrors({ 
          general: 'Authentication system configuration issue. Please contact support.'
        })
      } else {
        setErrors({ 
          general: errorMessage
        })
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleCustomizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsUpdatingCustomization(true)
    setErrors({})
    
    try {
      handleBrowserLanguage(customizationForm.language)
      setOriginalCustomizationForm({ ...customizationForm })
      setSuccessToastType('customization')
      setShowSuccessToast(true)
    } catch (error) {
      console.error('Error updating customization:', error)
      setErrors({ general: 'Failed to update customization. Please try again.' })
    } finally {
      setIsUpdatingCustomization(false)
    }
  }

  const handleSectionChange = (newSection: string) => {
    if (hasChanges && activeSection !== newSection) {
      setPendingSection(newSection)
      setShowUnsavedChangesDialog(true)
    }
  }

  // Confirm leaving without saving
  const handleLeaveAnyway = () => {
    // Reset forms to original state - This should be handled by the parent component
    setErrors({})
    
    if (pendingSection) {
      // Section change navigation - Parent component should handle setActiveSection  
    } else if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
    
    setShowUnsavedChangesDialog(false)
  }

  const handleCancelLeave = () => {
    setPendingSection(null)
    setPendingNavigation(null)
    setShowUnsavedChangesDialog(false)
  }

  return {
    handleProfileSubmit,
    handlePasswordSubmit,
    handleCustomizationSubmit,
    handleSectionChange,
    handleLeaveAnyway,
    handleCancelLeave,
  }
}

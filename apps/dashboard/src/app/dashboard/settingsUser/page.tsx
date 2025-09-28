"use client"

import React from "react"
import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"
import { useUserContext } from "@/app/hooks/contexts/UserProvider"
import { Separator } from "@/components/ui/separator"
import { Toast } from "@/components/ui/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  SettingsSidebar,
  ProfileSection,
  PasswordSection,
  CustomizationSection,
  useSettingsState,
  useSettingsActions,
} from "@/components/settings"

export default function SettingsUserPage() {
  const { t } = useTranslation("USER_SETTINGS")
  const { t: tl } = useTranslation("LANGUAJES")
  const { loading, user } = useUserContext()
  const settingsState = useSettingsState()

  const generateBreadcrumbs = () => {
    const userFullName = user?.firstName + " " + user?.lastName || "User";
    const breadcrumbs: Array<{ label: string; href?: string }> = [
      { label: userFullName }
    ];

    if (settingsState.activeSection) {
      const sectionLabels: Record<string, string> = {
        'profile': t('PROFILE.TITLE'),
        'password': t('PASSWORD.TITLE'),
        'customization': t('CUSTOMIZATION.TITLE')
      };
      
      breadcrumbs.push({ label: sectionLabels[settingsState.activeSection] || settingsState.activeSection });
    } else {
      breadcrumbs.push({ label: t('TITLE') });
    }

    return breadcrumbs;
  };
  
  // Use the custom hook for actions
  const settingsActions = useSettingsActions({
    hasChanges: settingsState.hasChanges,
    activeSection: settingsState.activeSection,
    profileForm: settingsState.profileForm,
    setOriginalProfileForm: settingsState.setOriginalProfileForm,
    passwordForm: settingsState.passwordForm,
    customizationForm: settingsState.customizationForm,
    setOriginalCustomizationForm: settingsState.setOriginalCustomizationForm,
    setIsUpdatingProfile: settingsState.setIsUpdatingProfile,
    setIsUpdatingPassword: settingsState.setIsUpdatingPassword,
    setIsUpdatingCustomization: settingsState.setIsUpdatingCustomization,
    setErrors: settingsState.setErrors,
    setPasswordForm: settingsState.setPasswordForm,
    setSuccessToastType: settingsState.setSuccessToastType,
    setShowSuccessToast: settingsState.setShowSuccessToast,
    setShowUnsavedChangesDialog: settingsState.setShowUnsavedChangesDialog,
    setPendingSection: settingsState.setPendingSection,
    setPendingNavigation: settingsState.setPendingNavigation,
    handleBrowserLanguage: settingsState.handleBrowserLanguage,
    originalProfileForm: settingsState.originalProfileForm,
    originalPasswordForm: settingsState.originalPasswordForm,
    originalCustomizationForm: settingsState.originalCustomizationForm,
    pendingSection: settingsState.pendingSection,
    pendingNavigation: settingsState.pendingNavigation,
    user: settingsState.user,
    updateUser: settingsState.updateUser,
    t,
  })

  // Enhanced section change handler that manages form resets
  const handleSectionChange = (newSection: string) => {
    if (settingsState.hasChanges && settingsState.activeSection !== newSection) {
      settingsState.setPendingSection(newSection)
      settingsState.setShowUnsavedChangesDialog(true)
    } else {
      settingsState.setActiveSection(newSection)
    }
  }

  // Enhanced leave anyway handler that resets forms
  const handleLeaveAnyway = () => {
    // Reset forms to original state
    if (settingsState.activeSection === 'profile') {
      settingsState.setProfileForm({ ...settingsState.originalProfileForm })
    } else if (settingsState.activeSection === 'password') {
      settingsState.setPasswordForm({ ...settingsState.originalPasswordForm })
    } else if (settingsState.activeSection === 'customization') {
      settingsState.setCustomizationForm({ ...settingsState.originalCustomizationForm })
    }
    settingsState.setErrors({})
    
    if (settingsState.pendingSection) {
      settingsState.setActiveSection(settingsState.pendingSection)
      settingsState.setPendingSection(null)
    } else if (settingsState.pendingNavigation) {
      settingsState.pendingNavigation()
      settingsState.setPendingNavigation(null)
    }
    
    settingsState.setShowUnsavedChangesDialog(false)
  }

  // Sidebar options
  const sidebarOptions = [
    { key: 'profile', label: t('PROFILE.TITLE'), active: true },
    { key: 'password', label: t('PASSWORD.TITLE'), active: true },
    { key: 'customization', label: t('CUSTOMIZATION.TITLE'), active: true }
  ]

  if (loading) {
    return (
      <>
        <DynamicPageHeader 
          breadcrumbs={generateBreadcrumbs()}
        />
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="space-y-6 max-w-2xl">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DynamicPageHeader 
        breadcrumbs={generateBreadcrumbs()}
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-xl font-semibold">{t('TITLE')}</h2>
        </div>
        
        <Separator />
        <div className="flex gap-8 max-w-6xl">
          <SettingsSidebar
            activeSection={settingsState.activeSection}
            onSectionChange={handleSectionChange}
            options={sidebarOptions}
          />
          <div className="flex-1">
            {settingsState.activeSection === 'profile' && (
              <ProfileSection
                form={settingsState.profileForm}
                setForm={settingsState.setProfileForm}
                user={settingsState.user}
                errors={settingsState.errors}
                setErrors={settingsState.setErrors}
                isUpdating={settingsState.isUpdatingProfile}
                hasChanges={settingsState.hasChanges}
                onSubmit={settingsActions.handleProfileSubmit}
                t={t}
              />
            )}
            
            {settingsState.activeSection === 'password' && (
              <PasswordSection
                form={settingsState.passwordForm}
                setForm={settingsState.setPasswordForm}
                errors={settingsState.errors}
                setErrors={settingsState.setErrors}
                isUpdating={settingsState.isUpdatingPassword}
                hasChanges={settingsState.hasChanges}
                onSubmit={settingsActions.handlePasswordSubmit}
                t={t}
              />
            )}
            
            {settingsState.activeSection === 'customization' && (
              <CustomizationSection
                form={settingsState.customizationForm}
                setForm={settingsState.setCustomizationForm}
                errors={settingsState.errors}
                isUpdating={settingsState.isUpdatingCustomization}
                hasChanges={settingsState.hasChanges}
                onSubmit={settingsActions.handleCustomizationSubmit}
                t={t}
                tl={tl}
              />
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={settingsState.showUnsavedChangesDialog} onOpenChange={settingsState.setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('UNSAVED_CHANGES.TITLE')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('UNSAVED_CHANGES.MESSAGE')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={settingsActions.handleCancelLeave}>
              {t('UNSAVED_CHANGES.CANCEL')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveAnyway}>
              {t('UNSAVED_CHANGES.LEAVE_ANYWAY')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      

      <Toast
        title={
          settingsState.successToastType === 'profile' ? t('PROFILE.SUCCESS_TITLE') :
          settingsState.successToastType === 'password' ? t('PASSWORD.SUCCESS_TITLE') :
          t('CUSTOMIZATION.SUCCESS_TITLE')
        }
        description={
          settingsState.successToastType === 'profile' ? t('PROFILE.SUCCESS_MESSAGE') :
          settingsState.successToastType === 'password' ? t('PASSWORD.SUCCESS_MESSAGE') :
          t('CUSTOMIZATION.SUCCESS_MESSAGE')
        }
        isVisible={settingsState.showSuccessToast}
        onClose={() => settingsState.setShowSuccessToast(false)}
        undoText="Undo"
      />
    </>
  )
}

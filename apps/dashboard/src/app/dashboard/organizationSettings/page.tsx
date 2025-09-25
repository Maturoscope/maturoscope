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
  OrganizationSettingsSidebar,
  OrganizationProfileSection,
  useOrganizationSettingsState,
  useOrganizationSettingsActions,
} from "@/components/organizationSettings"

export default function OrganizationSettingsPage() {
  const { t } = useTranslation("ORGANIZATION_SETTINGS")
  const { loading } = useUserContext()
  
  // Use the custom hook for state management
  const settingsState = useOrganizationSettingsState()
  
  // Use the custom hook for actions
  const settingsActions = useOrganizationSettingsActions({
    hasChanges: settingsState.hasChanges,
    activeSection: settingsState.activeSection,
    profileForm: settingsState.profileForm,
    setOriginalProfileForm: settingsState.setOriginalProfileForm,
    setIsUpdatingProfile: settingsState.setIsUpdatingProfile,
    setErrors: settingsState.setErrors,
    setSuccessToastType: settingsState.setSuccessToastType,
    setShowSuccessToast: settingsState.setShowSuccessToast,
    setShowUnsavedChangesDialog: settingsState.setShowUnsavedChangesDialog,
    setPendingSection: settingsState.setPendingSection,
    setPendingNavigation: settingsState.setPendingNavigation,
    originalProfileForm: settingsState.originalProfileForm,
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
    if (settingsState.pendingSection) {
      settingsActions.resetFormsForSection(settingsState.pendingSection)
      settingsState.setActiveSection(settingsState.pendingSection)
      settingsState.setPendingSection(null)
    }
    if (settingsState.pendingNavigation) {
      settingsState.pendingNavigation()
      settingsState.setPendingNavigation(null)
    }
    settingsState.setShowUnsavedChangesDialog(false)
  }

  // Enhanced save and continue handler
  const handleSaveAndContinue = async () => {
    try {
      await settingsActions.handleSaveCurrentSection()
      
      if (settingsState.pendingSection) {
        settingsState.setActiveSection(settingsState.pendingSection)
        settingsState.setPendingSection(null)
      }
      if (settingsState.pendingNavigation) {
        settingsState.pendingNavigation()
        settingsState.setPendingNavigation(null)
      }
      settingsState.setShowUnsavedChangesDialog(false)
    } catch (error) {
      console.error('Error saving organization settings:', error)
    }
  }

  const sidebarOptions = [
    { key: 'profile', label: t('SECTIONS.PROFILE'), active: true },
    { key: 'customization', label: t('SECTIONS.CUSTOMIZATION'), active: true },
  ]

  const renderActiveSection = () => {
    switch (settingsState.activeSection) {
      case 'profile':
        return (
          <OrganizationProfileSection
            form={settingsState.profileForm}
            setForm={settingsState.setProfileForm}
            user={settingsState.user}
            errors={settingsState.errors}
            setErrors={settingsState.setErrors}
            isUpdating={settingsState.isUpdatingProfile}
            hasChanges={settingsState.hasChanges}
            onSave={settingsActions.handleSaveProfile}
          />
        )
      case 'customization':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{t('CUSTOMIZATION.TITLE')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-gray-500">{t('CUSTOMIZATION.DESCRIPTION')}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => window.location.href = '/dashboard/settings'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('CUSTOMIZATION.GO_TO_SETTINGS_BUTTON')}
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <>
        <DynamicPageHeader 
          currentPageLabel={t('TITLE')} 
          activeSection={settingsState.activeSection} 
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
        currentPageLabel={t('TITLE')} 
        activeSection={settingsState.activeSection} 
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-xl font-semibold">{t('TITLE')}</h2>
        </div>
        
        <Separator />
        <div className="flex gap-8 max-w-6xl">
          <OrganizationSettingsSidebar
            activeSection={settingsState.activeSection}
            onSectionChange={handleSectionChange}
            options={sidebarOptions}
          />
          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {settingsState.showSuccessToast && (
        <Toast
          title={
            settingsState.successToastType === 'profile'
              ? t('TOASTS.PROFILE_SUCCESS')
              : t('TOASTS.GENERAL_SUCCESS')
          }
          isVisible={settingsState.showSuccessToast}
          onClose={() => settingsState.setShowSuccessToast(false)}
        />
      )}

      {/* Unsaved Changes Dialog */}
      <AlertDialog
        open={settingsState.showUnsavedChangesDialog}
        onOpenChange={settingsState.setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('DIALOGS.UNSAVED_CHANGES.TITLE')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('DIALOGS.UNSAVED_CHANGES.DESCRIPTION')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settingsState.setShowUnsavedChangesDialog(false)}>
              {t('DIALOGS.UNSAVED_CHANGES.CANCEL')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveAnyway}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('DIALOGS.UNSAVED_CHANGES.LEAVE_ANYWAY')}
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndContinue}>
              {t('DIALOGS.UNSAVED_CHANGES.SAVE_AND_CONTINUE')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

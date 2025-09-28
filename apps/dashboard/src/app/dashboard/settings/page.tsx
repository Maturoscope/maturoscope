"use client";

import React, { useState, useEffect } from "react";
import { DynamicPageHeader } from "@/components/DynamicPageHeader";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";
import { Separator } from "@/components/ui/separator";
import { Toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ToolSettingsSidebar,
  ToolCustomizationSection,
  useToolSettingsState,
  useToolSettingsActions,
} from "@/components/toolSettings";
import { Button } from "@/components/ui/button";
import { OrganizationService } from "@/services/organization.service";
import { Input } from "@/components/ui/input";
import { useImageVersion } from "@/hooks/useImageVersion";
import { IMAGE_VERSION_CONSTANTS } from "@/constants/imageVersion";
import { revokePreviewUrl, clearFileInput } from "@/utils/fileValidation";
import { AvatarUploadSection } from "@/components/profile";

export default function SettingsPage() {
  const { t } = useTranslation("TOOL_SETTINGS");
  const { t: tp } = useTranslation("PROFILE_SETTINGS");
  const { loading, user, refetch: refetchUser } = useUserContext();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showRemoveAvatarDialog, setShowRemoveAvatarDialog] = useState(false);
  const [avatarToRemove, setAvatarToRemove] = useState(false); // Flag to indicate avatar should be removed
  
  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string>('');

  // Use the custom hook for state management
  const settingsState = useToolSettingsState();

  const { updateVersion: updateAvatarVersion, getVersionedUrl } = useImageVersion({
    storageKey: IMAGE_VERSION_CONSTANTS.STORAGE_KEYS.AVATAR,
    eventName: IMAGE_VERSION_CONSTANTS.EVENTS.AVATAR_UPDATED
  });

  const { updateVersion: updateSignatureVersion } = useImageVersion({
    storageKey: IMAGE_VERSION_CONSTANTS.STORAGE_KEYS.SIGNATURE,
    eventName: IMAGE_VERSION_CONSTANTS.EVENTS.SIGNATURE_UPDATED
  });

  // Generate dynamic breadcrumbs
  const generateBreadcrumbs = () => {
    const organizationName = user?.organization?.name || "Organization";
    const breadcrumbs: Array<{ label: string; href?: string }> = [
      { label: organizationName }
    ];

    if (settingsState.activeSection) {
      breadcrumbs.push({ label: t("TITLE") });
      
      const sectionLabel = settingsState.activeSection === 'profile' 
        ? tp("TITLE")
        : t("SECTIONS.CUSTOMIZATION");
      
      breadcrumbs.push({ label: sectionLabel });
    } else {
      breadcrumbs.push({ label: t("TITLE") });
    }

    return breadcrumbs;
  };

  // Profile changes tracking
  const hasProfileChanges = avatarFile !== null || avatarToRemove;

  // Customization changes tracking
  const hasCustomizationChanges = 
    settingsState.customizationForm.font !== settingsState.originalCustomizationForm.font ||
    settingsState.customizationForm.theme !== settingsState.originalCustomizationForm.theme ||
    settingsState.pdfSignatureForm.signatureFile !== null ||
    settingsState.languageForm.language !== settingsState.originalLanguageForm.language;

  // Intercept navigation when there are unsaved changes
  useEffect(() => {
    const currentHasChanges = settingsState.activeSection === 'profile' 
      ? hasProfileChanges 
      : hasCustomizationChanges;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentHasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (currentHasChanges) {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement;
        
        if (link && link.href) {
          const currentOrigin = window.location.origin;
          const linkUrl = new URL(link.href);
          
          if (linkUrl.origin === currentOrigin) {
            e.preventDefault();
            e.stopPropagation();
            
            settingsState.setPendingNavigation(() => () => {
              window.location.href = link.href;
            });
            settingsState.setShowUnsavedChangesDialog(true);
          }
        }
      }
    };

    if (currentHasChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('click', handleClick, true);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [settingsState.activeSection, hasProfileChanges, hasCustomizationChanges, settingsState]);

  // Use the custom hook for actions
  const settingsActions = useToolSettingsActions({
    customizationForm: settingsState.customizationForm,
    setOriginalCustomizationForm: settingsState.setOriginalCustomizationForm,
    pdfSignatureForm: settingsState.pdfSignatureForm,
    setOriginalPDFSignatureForm: settingsState.setOriginalPDFSignatureForm,
    setPDFSignatureForm: settingsState.setPDFSignatureForm,
    languageForm: settingsState.languageForm,
    setOriginalLanguageForm: settingsState.setOriginalLanguageForm,
    setIsUpdatingCustomization: settingsState.setIsUpdatingCustomization,
    setIsUpdatingPDFSignature: settingsState.setIsUpdatingPDFSignature,
    setIsUpdatingLanguage: settingsState.setIsUpdatingLanguage,
    setErrors: settingsState.setErrors,
    setSuccessToastType: settingsState.setSuccessToastType,
    setShowSuccessToast: settingsState.setShowSuccessToast,
    updateSignatureVersion,
  });

  // Enhanced section change handler that manages form resets
  const handleSectionChange = (newSection: string) => {
    const currentHasChanges = settingsState.activeSection === 'profile' 
      ? hasProfileChanges 
      : hasCustomizationChanges;
      
    if (currentHasChanges && settingsState.activeSection !== newSection) {
      settingsState.setPendingSection(newSection);
      settingsState.setShowUnsavedChangesDialog(true);
    } else {
      settingsState.setActiveSection(newSection);
    }
  };

  const handleLeaveAnyway = () => {
    if (settingsState.activeSection === 'profile') {
      setAvatarFile(null);
      setAvatarToRemove(false);
      setAvatarPreview(null);
      
      const input = document.getElementById("avatar-upload") as HTMLInputElement;
      if (input) {
        input.value = "";
      }
    }
    
    if (settingsState.activeSection === 'customization') {
      settingsState.setCustomizationForm({ ...settingsState.originalCustomizationForm });
      settingsState.setPDFSignatureForm({ 
        signatureFile: null, 
        signatureUrl: settingsState.originalPDFSignatureForm.signatureUrl 
      });
      settingsState.setLanguageForm({ ...settingsState.originalLanguageForm });
    }
    
    if (settingsState.pendingSection) {
      settingsState.setActiveSection(settingsState.pendingSection);
      settingsState.setPendingSection(null);
    }
    if (settingsState.pendingNavigation) {
      settingsState.pendingNavigation();
      settingsState.setPendingNavigation(null);
    }
    settingsState.setShowUnsavedChangesDialog(false);
  };



  const removeAvatar = () => {
    if (avatarPreview) {
      revokePreviewUrl(avatarPreview);
    }
    setAvatarPreview(null);
    setAvatarFile(null);
    setErrorMessage('');
    setAvatarToRemove(true);
    clearFileInput("avatar-upload");
  };

  // Function to handle remove avatar confirmation
  const handleRemoveAvatarClick = () => {
    setShowRemoveAvatarDialog(true);
  };

  const confirmRemoveAvatar = () => {
    removeAvatar();
    setShowRemoveAvatarDialog(false);
  };

  const handleUpdateProfile = async () => {
    if (!avatarFile && !avatarToRemove) {
      setErrorMessage("No changes to save.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    if (avatarError) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setErrorMessage('');
      setAvatarError('');

      if (avatarToRemove) {
        await OrganizationService.removeAvatar();
        setAvatarToRemove(false);
        updateAvatarVersion();
      } else if (avatarFile) {
        await OrganizationService.uploadAvatar(avatarFile);
        if (avatarPreview && avatarPreview.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(null);
        setAvatarFile(null);
        
        const input = document.getElementById("avatar-upload") as HTMLInputElement;
        if (input) {
          input.value = "";
        }
      }

      await refetchUser();
      updateAvatarVersion();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update profile';
      setErrorMessage(errorMsg);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  const sidebarOptions = [
    { key: "profile", label: tp("TITLE"), active: true },
    { key: "customization", label: t("SECTIONS.CUSTOMIZATION"), active: true },
  ];

  const renderActiveSection = () => {
    switch (settingsState.activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{tp("TITLE")}</h2>
            </div>
           
            <Separator />
            <div className="space-y-6">
              {/* Organization Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {tp("NAME.LABEL")}
                </label>
                <Input
                  type="text"
                  value={user?.organization?.name || tp("NAME.VALUE")}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Avatar */}
              <AvatarUploadSection
                user={user}
                avatarPreview={avatarPreview}
                setAvatarPreview={setAvatarPreview}
                setAvatarFile={setAvatarFile}
                avatarToRemove={avatarToRemove}
                setAvatarToRemove={setAvatarToRemove}
                avatarError={avatarError}
                setAvatarError={setAvatarError}
                onRemoveClick={handleRemoveAvatarClick}
                getVersionedUrl={getVersionedUrl}
              />

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {tp("USERNAME.LABEL")}
                </label>
                <Input
                  type="text"
                  value={user?.organization?.key || tp("USERNAME.VALUE")}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {tp("EMAIL.LABEL")}
                </label>
                <Input
                  type="email"
                  value={user?.organization?.email || tp("EMAIL.VALUE")}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-start">
                <Button
                  disabled={isUploadingAvatar || (!avatarFile && !avatarToRemove)}
                  onClick={handleUpdateProfile}
                  className={'px-6'}
                >
                  {isUploadingAvatar ? 'Updating...' : tp("UPDATE_BUTTON")}
                </Button>
              </div>
            </div>
          </div>
        );
      case "customization":
        return (
          <ToolCustomizationSection
            customizationForm={settingsState.customizationForm}
            setCustomizationForm={settingsState.setCustomizationForm}
            pdfSignatureForm={settingsState.pdfSignatureForm}
            setPDFSignatureForm={settingsState.setPDFSignatureForm}
            languageForm={settingsState.languageForm}
            setLanguageForm={settingsState.setLanguageForm}
            errors={settingsState.errors}
            setErrors={settingsState.setErrors}
            isUpdating={
              settingsState.isUpdatingCustomization ||
              settingsState.isUpdatingPDFSignature ||
              settingsState.isUpdatingLanguage
            }
            hasChanges={hasCustomizationChanges}
            onSaveAll={settingsActions.handleSaveAll}
          />
        );
      default:
        return null;
    }
  };

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
    );
  }

  return (
    <>
      <DynamicPageHeader
        breadcrumbs={generateBreadcrumbs()}
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-xl font-semibold">{t("ORGANIZATION_SETTINGS")}</h2>
        </div>

        <Separator />
        <div className="flex gap-8 max-w-6xl">
          <ToolSettingsSidebar
            activeSection={settingsState.activeSection}
            onSectionChange={handleSectionChange}
            options={sidebarOptions}
          />
          <div className="flex-1">{renderActiveSection()}</div>
        </div>
      </div>

      {settingsState.showSuccessToast && (
        <Toast
          title={
            settingsState.successToastType === "customization"
              ? t("TOASTS.CUSTOMIZATION_SUCCESS.TITLE")
              : settingsState.successToastType === "pdfSignature"
                ? t("TOASTS.PDF_SIGNATURE_SUCCESS.TITLE")
                : t("TOASTS.LANGUAGE_SUCCESS.TITLE")
          }
          description={
            settingsState.successToastType === "customization"
              ? t("TOASTS.CUSTOMIZATION_SUCCESS.DESCRIPTION")
              : settingsState.successToastType === "pdfSignature"
                ? t("TOASTS.PDF_SIGNATURE_SUCCESS.DESCRIPTION")
                : t("TOASTS.LANGUAGE_SUCCESS.DESCRIPTION")
          }
          isVisible={settingsState.showSuccessToast}
          onClose={() => settingsState.setShowSuccessToast(false)}
        />
      )}

      <AlertDialog
        open={settingsState.showUnsavedChangesDialog}
        onOpenChange={settingsState.setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("DIALOGS.UNSAVED_CHANGES.TITLE")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("DIALOGS.UNSAVED_CHANGES.DESCRIPTION")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => settingsState.setShowUnsavedChangesDialog(false)}
            >
              {t("DIALOGS.UNSAVED_CHANGES.CANCEL")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveAnyway}
              className="bg-gray-900 hover:bg-gray-1000"
            >
              {t("DIALOGS.UNSAVED_CHANGES.LEAVE_ANYWAY")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Avatar Confirmation Dialog */}
      <AlertDialog open={showRemoveAvatarDialog} onOpenChange={setShowRemoveAvatarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tp("AVATAR.REMOVE_DIALOG.TITLE")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tp("AVATAR.REMOVE_DIALOG.DESCRIPTION")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRemoveAvatarDialog(false)}>
              {tp("AVATAR.REMOVE_DIALOG.CANCEL")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveAvatar}
              className="bg-red-600 hover:bg-red-700"
            >
              {tp("AVATAR.REMOVE_DIALOG.CONFIRM")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showSuccessToast && (
        <Toast
          title={tp("TOASTS.SUCCESS_TITLE")}
          description={tp("TOASTS.SUCCESS_DESCRIPTION")}
          isVisible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {showErrorToast && (
        <Toast
          title={tp("TOASTS.ERROR_TITLE")}
          description={errorMessage}
          isVisible={showErrorToast}
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </>
  );
}

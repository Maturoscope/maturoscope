import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { validateFile, createPreviewUrl } from '@/utils/fileValidation';
import { UserAvatarData } from '@/types/image';

interface AvatarUploadSectionProps {
  user: UserAvatarData | null;
  avatarPreview: string | null;
  setAvatarPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  avatarToRemove: boolean;
  setAvatarToRemove: React.Dispatch<React.SetStateAction<boolean>>;
  avatarError: string;
  setAvatarError: React.Dispatch<React.SetStateAction<string>>;
  onRemoveClick: () => void;
  getVersionedUrl: (url: string | null | undefined) => string;
}

const getOrganizationInitials = (name?: string): string => {
  if (!name) return 'ORG';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function AvatarUploadSection({
  user,
  avatarPreview,
  setAvatarPreview,
  setAvatarFile,
  avatarToRemove,
  setAvatarToRemove,
  avatarError,
  setAvatarError,
  onRemoveClick,
  getVersionedUrl,
}: AvatarUploadSectionProps) {
  const { t } = useTranslation("PROFILE_SETTINGS");

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    const validation = validateFile(file, 'avatar');
    if (!validation.isValid) {
      setAvatarError(validation.error!);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(createPreviewUrl(file));
    setAvatarToRemove(false);
  };

  const handleUploadClick = () => {
    setAvatarError('');
    document.getElementById("avatar-upload")?.click();
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700">
        {t("AVATAR.LABEL")}
      </label>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden">
            {avatarPreview && !avatarToRemove ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : user?.organization?.avatar && !avatarToRemove ? (
              <img
                src={getVersionedUrl(user.organization.avatar)}
                alt="Organization avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {getOrganizationInitials(user?.organization?.name)}
                </span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
          >
            {t("AVATAR.UPLOAD_BUTTON")}
          </Button>
        </div>
        
        <Button
          disabled={!user?.organization?.avatar && !avatarPreview}
          variant="destructive"
          size="sm"
          onClick={onRemoveClick}
        >
          {t("AVATAR.REMOVE_BUTTON")}
        </Button>
      </div>
      
      <input
        id="avatar-upload"
        type="file"
        accept=".svg,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleAvatarUpload}
      />
      
      <p className="text-xs text-gray-900 font-medium">
        {t("AVATAR.REQUIREMENTS")}
      </p>
      
      {avatarError && (
        <p className="text-sm text-red-600">{avatarError}</p>
      )}
    </div>
  );
}

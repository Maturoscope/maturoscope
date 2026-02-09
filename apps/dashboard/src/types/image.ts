export interface ImageVersionConfig {
  storageKey: string;
  eventName?: string;
}

export interface ImageVersionHook {
  version: number;
  updateVersion: () => void;
  getVersionedUrl: (url: string | null | undefined) => string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UserAvatarData {
  picture?: string;
  firstName?: string;
  name?: string;
  organization?: {
    name?: string;
    avatar?: string;
  };
}

export type ImageType = 'avatar' | 'signature';

export interface ImageUploadProps {
  file: File;
  type: ImageType;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

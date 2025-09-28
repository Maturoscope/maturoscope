import { FILE_VALIDATION } from '@/constants/imageVersion';
import { FileValidationResult, ImageType } from '@/types/image';

export const validateFile = (file: File, type: ImageType): FileValidationResult => {
  const config = FILE_VALIDATION[type.toUpperCase() as keyof typeof FILE_VALIDATION];
  
  if (file.size > config.MAX_SIZE) {
    return {
      isValid: false,
      error: `File is too large. Max size is ${config.MAX_SIZE / (1024 * 1024)}MB.`
    };
  }

  if (!(config.ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Accepted types: ${config.ACCEPTED_TYPES.join(', ')}`
    };
  }

  return { isValid: true };
};

export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokePreviewUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export const clearFileInput = (inputId: string): void => {
  const input = document.getElementById(inputId) as HTMLInputElement;
  if (input) {
    input.value = '';
  }
};

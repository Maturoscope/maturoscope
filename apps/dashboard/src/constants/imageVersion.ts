export const IMAGE_VERSION_CONSTANTS = {
  STORAGE_KEYS: {
    AVATAR: 'avatarVersion',
    SIGNATURE: 'signatureVersion',
  },
  EVENTS: {
    AVATAR_UPDATED: 'avatarUpdated',
    SIGNATURE_UPDATED: 'signatureUpdated',
  },
  DEFAULT_VERSION: 1,
  FALLBACK_IMAGES: {
    LOGO: '/logo.png',
    USER_PLACEHOLDER: 'U',
  },
} as const;

export const FILE_VALIDATION = {
  AVATAR: {
    MAX_SIZE: 4 * 1024 * 1024, // 4MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml'] as const,
  },
  SIGNATURE: {
    MAX_SIZE: 4 * 1024 * 1024, // 4MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml'] as const,
  },
} as const;

export const UI_CONSTANTS = {
  DROPDOWN_WIDTH: 'w-[200px]',
  AVATAR_SIZE: 'h-8 w-8',
  SIGNATURE_DIMENSIONS: {
    WIDTH: 240,
    HEIGHT: 102,
    MAX_DISPLAY_HEIGHT: 100,
    MAX_DISPLAY_WIDTH: 240,
  },
  ANIMATION_DURATION: 200,
} as const;

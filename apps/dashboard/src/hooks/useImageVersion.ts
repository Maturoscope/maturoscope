import { useState, useEffect, useCallback } from 'react';
import { IMAGE_VERSION_CONSTANTS } from '@/constants/imageVersion';
import { ImageVersionConfig, ImageVersionHook } from '@/types/image';

const getStoredVersion = (storageKey: string): number => {
  if (typeof window === 'undefined') return IMAGE_VERSION_CONSTANTS.DEFAULT_VERSION;
  
  const stored = localStorage.getItem(storageKey);
  return stored ? parseInt(stored, 10) : IMAGE_VERSION_CONSTANTS.DEFAULT_VERSION;
};

const isValidUrl = (url: string | null | undefined): url is string => {
  return Boolean(url && url.trim());
};

const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

export const useImageVersion = ({ 
  storageKey, 
  eventName 
}: ImageVersionConfig): ImageVersionHook => {
  const [version, setVersion] = useState<number>(() => getStoredVersion(storageKey));

  const updateVersion = useCallback(() => {
    const newVersion = Date.now();
    setVersion(newVersion);
    localStorage.setItem(storageKey, newVersion.toString());
    
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName));
    }
  }, [storageKey, eventName]);

  useEffect(() => {
    if (!eventName) return;

    const handleUpdate = () => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setVersion(parseInt(stored, 10));
      }
    };

    window.addEventListener(eventName, handleUpdate);
    return () => window.removeEventListener(eventName, handleUpdate);
  }, [eventName, storageKey]);

  const getVersionedUrl = useCallback((url: string | null | undefined): string => {
    if (!isValidUrl(url)) return '';
    if (isBlobUrl(url)) return url;
    
    return `${url}?v=${version}`;
  }, [version]);

  return {
    version,
    updateVersion,
    getVersionedUrl
  };
};

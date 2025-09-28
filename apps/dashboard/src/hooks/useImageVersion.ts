import { useState, useEffect, useCallback } from 'react';

interface UseImageVersionOptions {
  storageKey: string;
  eventName?: string;
}

interface UseImageVersionReturn {
  version: number;
  updateVersion: () => void;
  getVersionedUrl: (url: string | null | undefined) => string;
}

export const useImageVersion = ({ 
  storageKey, 
  eventName 
}: UseImageVersionOptions): UseImageVersionReturn => {
  const [version, setVersion] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored ? parseInt(stored, 10) : 1;
    }
    return 1;
  });

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
    if (!url) return '';
    
    if (url.startsWith('blob:')) {
      return url;
    }
    
    return `${url}?v=${version}`;
  }, [version]);

  return {
    version,
    updateVersion,
    getVersionedUrl
  };
};

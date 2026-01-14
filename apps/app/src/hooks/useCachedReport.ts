/**
 * useCachedReport Hook
 * 
 * Manages PDF generation and caching with the following behavior:
 * 
 * 1. PDF Generation:
 *    - Generates PDF once and caches it on the backend for 15 minutes
 *    - Stores cache ID in sessionStorage for persistence across page refreshes
 *    - Sends heartbeat every 30 seconds to keep session alive
 * 
 * 2. PDF Downloads:
 *    - Multiple downloads are allowed within the 15-minute cache window
 *    - Each download fetches from cache (fast, no regeneration needed)
 *    - Cache is NOT deleted after download - it stays for the full 15 minutes
 * 
 * 3. Cache Expiration:
 *    - After 15 minutes, the next download attempt will auto-regenerate
 *    - Backend automatically cleans up expired PDFs
 *    - Frontend only deletes cache when user closes tab or navigates away
 * 
 * 4. Cleanup:
 *    - Automatic: When user closes tab or navigates away from app
 *    - Manual: By calling clearCache() (optional)
 *    - Natural: Backend expires cache after 15 minutes of inactivity
 */
import { useState, useCallback, useEffect } from 'react';
import type { Locale } from '@/dictionaries/dictionaries';
import type { ReportPayload } from './useDownloadReport';

interface CachedReportInfo {
  pdfId: string | null;
  expiresIn: number;
  generatedAt: number;
}

interface UseCachedReportReturn {
  pdfId: string | null; // Current cached PDF ID (valid for 15 minutes)
  isGenerating: boolean; // True while generating a new PDF
  isDownloading: boolean; // True while downloading a PDF
  generateAndCachePdf: (payload: ReportPayload, lang: Locale) => Promise<string | null>; // Generate and cache PDF (returns cache ID)
  downloadCachedPdf: (regeneratePayload?: { payload: ReportPayload; lang: Locale }) => Promise<void>; // Download from cache (auto-regenerate if expired)
  clearCache: () => Promise<void>; // Manually clear cache (optional - expires naturally after 15 min)
}

const CACHE_KEY = 'cached_pdf_info';

export const useCachedReport = (): UseCachedReportReturn => {
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load cached PDF info from sessionStorage on mount
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const info: CachedReportInfo = JSON.parse(cached);
        // Check if still valid (not expired)
        const now = Date.now();
        const elapsedSeconds = (now - info.generatedAt) / 1000;
        if (elapsedSeconds < info.expiresIn) {
          setPdfId(info.pdfId);
        } else {
          // Expired, clear it
          sessionStorage.removeItem(CACHE_KEY);
        }
      } catch (error) {
        console.error('Error loading cached PDF info:', error);
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
  }, []);

  // Heartbeat: ping backend every 30 seconds to keep session alive
  // If heartbeat stops, backend can assume session is dead
  useEffect(() => {
    if (!pdfId) return;

    const heartbeatInterval = setInterval(() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // Silent ping - just to keep connection alive
      fetch(`${apiUrl}/report/cache/heartbeat/${pdfId}`, {
        method: 'POST',
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {
        // Silently fail - heartbeat is best effort
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [pdfId]);

  // Register cleanup ONLY on actual page unload (not on visibility changes)
  // Let the PDF cache expire naturally on the backend (15 minutes)
  // This allows users to download multiple times within the cache window
  useEffect(() => {
    const deleteCachedPdf = (pdfId: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      fetch(`${apiUrl}/report/cached/${pdfId}`, {
        method: 'DELETE',
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {
        // Silently ignore - expected during page unload
      });
    };

    const handleCleanup = () => {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const info: CachedReportInfo = JSON.parse(cached);
          if (info.pdfId) {
            deleteCachedPdf(info.pdfId);
          }
        } catch {
          // Silently ignore errors during cleanup
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    };

    // ONLY cleanup on actual page unload (when user closes tab or navigates away)
    // Do NOT cleanup on visibility changes (tab switches, minimize, etc.)
    // This allows the PDF to stay cached for 15 minutes for multiple downloads
    
    // pagehide: when page is being unloaded (most reliable)
    const handlePageHide = (event: PageTransitionEvent) => {
      // Only cleanup if page is actually being unloaded (not just cached for back/forward)
      if (!event.persisted) {
        handleCleanup();
      }
    };

    // beforeunload: fallback for older browsers
    const handleBeforeUnload = () => {
      handleCleanup();
    };

    // Add event listeners (removed visibilitychange to prevent premature deletion)
    window.addEventListener('pagehide', handlePageHide as any);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide as any);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  /**
   * Generate a PDF and cache it on the backend
   */
  const generateAndCachePdf = useCallback(async (
    payload: ReportPayload,
    lang: Locale
  ): Promise<string | null> => {
    // If already have a valid cached PDF, return it
    if (pdfId) {
      return pdfId;
    }

    setIsGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = `${apiUrl}/report/generate-cached/${lang}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate cached PDF: ${response.statusText} - ${errorText}`);
      }

      const data: { pdfId: string; expiresIn: number } = await response.json();
      
      // Save to sessionStorage
      const cacheInfo: CachedReportInfo = {
        pdfId: data.pdfId,
        expiresIn: data.expiresIn,
        generatedAt: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheInfo));
      setPdfId(data.pdfId);

      return data.pdfId;
    } catch (error) {
      console.error('Error generating cached PDF:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [pdfId]);

  /**
   * Download the cached PDF (with auto-regeneration if expired)
   * 
   * Logic:
   * 1. If pdfId exists in session, try to download from cache (valid for 15 minutes)
   * 2. If successful, download immediately (can be called multiple times within 15 min window)
   * 3. If 404 (expired after 15 min), regenerate and download
   * 4. The PDF stays in cache for its full lifetime - not deleted after first download
   */
  const downloadCachedPdf = useCallback(async (regeneratePayload?: { payload: ReportPayload; lang: Locale }) => {
    if (!pdfId && !regeneratePayload) {
      return;
    }

    setIsDownloading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Try to download the cached PDF (should be available for 15 minutes)
      if (pdfId) {
        const response = await fetch(`${apiUrl}/report/cached/${pdfId}`);

        if (response.ok) {
          // Success - download the PDF (cache is preserved for next download)
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'maturity-report.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          return;
        }

        // If 404 (cache expired after 15 minutes), regenerate
        if (response.status === 404 && regeneratePayload) {
          // Clear old session data
          sessionStorage.removeItem(CACHE_KEY);
          setPdfId(null);
          
          // Generate new PDF and update session
          const newPdfId = await generateAndCachePdf(regeneratePayload.payload, regeneratePayload.lang);
          
          if (newPdfId) {
            // Retry download with new PDF
            const retryResponse = await fetch(`${apiUrl}/report/cached/${newPdfId}`);
            if (retryResponse.ok) {
              const blob = await retryResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'maturity-report.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              return;
            }
          }
        }

        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }

      // No pdfId but have regeneration data - generate and download
      if (regeneratePayload) {
        const newPdfId = await generateAndCachePdf(regeneratePayload.payload, regeneratePayload.lang);
        
        if (newPdfId) {
          const response = await fetch(`${apiUrl}/report/cached/${newPdfId}`);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'maturity-report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return;
          }
        }
      }

      throw new Error('Unable to download or regenerate PDF');
    } catch (error) {
      console.error('Error downloading cached PDF:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, [pdfId, generateAndCachePdf]);

  /**
   * Manually clear the cache and delete from backend
   * Note: This is only needed if you want to force immediate cleanup.
   * Otherwise, the cache will expire naturally after 15 minutes.
   */
  const clearCache = useCallback(async () => {
    if (!pdfId) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/report/cached/${pdfId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      sessionStorage.removeItem(CACHE_KEY);
      setPdfId(null);
    }
  }, [pdfId]);

  return {
    pdfId,
    isGenerating,
    isDownloading,
    generateAndCachePdf,
    downloadCachedPdf,
    clearCache,
  };
};


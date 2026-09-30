import { orgStorage } from "@/lib/orgStorage"
const STORAGE_KEY = "report-pdf-cache"

interface PdfCacheEntry {
  base64: string
  lang: string
}

export const pdfCache = {
  set(base64: string, lang: string): void {
    try {
      const entry: PdfCacheEntry = { base64, lang }
      orgStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
    } catch {
      // localStorage can throw if storage is full; fail silently
    }
  },

  get(lang: string): string | null {
    try {
      const raw = orgStorage.getItem(STORAGE_KEY)
      if (!raw) return null

      const entry = JSON.parse(raw) as PdfCacheEntry

      // Invalidate if the language changed (e.g. user switched EN ↔ FR)
      if (entry.lang !== lang) {
        orgStorage.removeItem(STORAGE_KEY)
        return null
      }

      return entry.base64
    } catch {
      return null
    }
  },

  clear(): void {
    try {
      orgStorage.removeItem(STORAGE_KEY)
    } catch {
      // fail silently
    }
  },
}

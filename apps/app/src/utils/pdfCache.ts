const STORAGE_KEY = "report-pdf-cache"

interface PdfCacheEntry {
  base64: string
  lang: string
}

export const pdfCache = {
  set(base64: string, lang: string): void {
    try {
      const entry: PdfCacheEntry = { base64, lang }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
    } catch {
      // localStorage can throw if storage is full; fail silently
    }
  },

  get(lang: string): string | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null

      const entry = JSON.parse(raw) as PdfCacheEntry

      // Invalidate if the language changed (e.g. user switched EN ↔ FR)
      if (entry.lang !== lang) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return entry.base64
    } catch {
      return null
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // fail silently
    }
  },
}

import { useCallback, useEffect, useState } from 'react'
import {
  LanguagesService,
  LanguageStatus,
  LanguageCode,
} from '@/services/languages.service'

/**
 * Loads and mutates the organization's language availability. The Live/Draft
 * status is derived server-side, so every mutation returns the refreshed list.
 */
export function useLanguages() {
  const [languages, setLanguages] = useState<LanguageStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setLanguages(await LanguagesService.getLanguages())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load languages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const toggle = useCallback(
    async (code: LanguageCode, enabled: boolean) => {
      const next = await LanguagesService.setLanguageEnabled(code, enabled)
      setLanguages(next)
      return next
    },
    [],
  )

  const setDefault = useCallback(async (code: LanguageCode) => {
    const next = await LanguagesService.setDefaultLanguage(code)
    setLanguages(next)
    return next
  }, [])

  return { languages, loading, error, refetch, toggle, setDefault }
}

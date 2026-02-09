"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const OrganizationKeyHandler = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const keyFromUrl = searchParams.get("key")
    
    // Get organization key from cookie
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null
      }
      return null
    }

    const keyFromCookie = getCookie("organization-key")

    // If both keys exist and they're different, reset everything
    if (keyFromUrl && keyFromCookie && keyFromUrl !== keyFromCookie) {
      // Clear all localStorage
      localStorage.clear()

      // Clear the organization-key cookie
      document.cookie = "organization-key=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Reload the page to start fresh with the new key
      window.location.reload()
    }
  }, [searchParams])

  return null
}

export default OrganizationKeyHandler

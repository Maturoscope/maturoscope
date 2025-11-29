"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const OrganizationKeyHandler = () => {
  const searchParams = useSearchParams()
  const key = searchParams.get("key")

  useEffect(() => {
    if (key) {
      // Store organization key in cookie (expires in 7 days)
      const expires = new Date()
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
      document.cookie = `organization-key=${key}; expires=${expires.toUTCString()}; path=/`
    }
  }, [key])

  return null
}

export default OrganizationKeyHandler


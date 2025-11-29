"use server"

import { cookies } from "next/headers"
import { DEFAULT_ACCENT_THEME } from "@/context/ThemeContext"

export type AccentTheme =
  | "default"
  | "orange"
  | "blue"
  | "green"
  | "pink"
  | "violet"

const VALID_ACCENT_THEMES: AccentTheme[] = [
  "default",
  "orange",
  "blue",
  "green",
  "pink",
  "violet",
]

const getOrganizationByKey = async (key: string) => {
  if (!key) return false

  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/key/${key}`
  const response = await fetch(endpoint)
  const organization = await response.json()

  return organization
}

export const getOrganizationAccentColor = async (
  key: string | null | undefined
): Promise<AccentTheme> => {
  if (!key) return "default"

  try {
    const organization = await getOrganizationByKey(key)
    const accentColor = organization?.accentColor || organization?.theme || null

    console.log({ accentColor })

    if (accentColor && VALID_ACCENT_THEMES.includes(accentColor)) {
      return accentColor as AccentTheme
    }

    return DEFAULT_ACCENT_THEME
  } catch (error) {
    console.error("Error fetching accent color:", error)
    return DEFAULT_ACCENT_THEME
  }
}

export const getOrganizationKeyFromCookies = async (): Promise<
  string | null
> => {
  const cookieStore = await cookies()
  return cookieStore.get("organization-key")?.value || null
}

export { getOrganizationByKey }

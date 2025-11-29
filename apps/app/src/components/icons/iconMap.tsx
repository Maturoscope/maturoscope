import type React from "react"
import {
  CriteriaTrlIcon,
  CriteriaMkrlIcon,
  CriteriaMfrlIcon,
} from "./index"

const iconMap: Record<
  string,
  React.ComponentType<{ accent?: boolean; className?: string }>
> = {
  "/icons/homepage/criteria-trl.svg": CriteriaTrlIcon,
  "/icons/homepage/criteria-mkrl.svg": CriteriaMkrlIcon,
  "/icons/homepage/criteria-mfrl.svg": CriteriaMfrlIcon,
}

export const getIconComponent = (
  iconPath: string
): React.ComponentType<{ accent?: boolean; className?: string }> | null => {
  return iconMap[iconPath] || null
}

export { iconMap }


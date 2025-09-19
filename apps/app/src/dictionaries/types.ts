import { HeadingProps } from "@/components/common/Heading/Heading"
import { KeysCriteriaProps } from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"

export type Lang = "en" | "fr"

export type Dictionary = {
  lang: Lang
  header: {
    stringConnector: string
  }
  homepage: {
    hero: {
      heading: HeadingProps & { buttonLabel: string }
      criteria: KeysCriteriaProps
    }
    policy: {
      description: string
    }
  }
}

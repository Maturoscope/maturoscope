// Components
import { HeadingProps } from "@/components/common/Heading/Heading"
import { KeysCriteriaProps } from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"
// Types
import { ListItem } from "@/types/list-item"

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
  why: {
    hero: {
      heading: HeadingProps & {
        list: ListItem[]
        buttonLabel: string
      }
      checks: ListItem[]
    }
  }
}

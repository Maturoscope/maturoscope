// Components
import { HeadingProps } from "@/components/common/Heading/Heading"
import { KeysCriteriaProps } from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"
// Types
import { ListItem } from "@/types/list-item"
import { Locale } from "@/dictionaries/dictionaries"
import { Stage } from "@/app/[lang]/form/page"

export type Dictionary = {
  lang: Locale
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
  form: {
    buttonNextLabel: string
    buttonPrevLabel: string
    stages: Stage[]
  }
}

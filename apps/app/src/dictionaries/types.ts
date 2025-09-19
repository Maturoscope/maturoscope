import { HeadingProps } from "@/components/common/Heading/Heading"

export type Lang = "en" | "fr"

export type Dictionary = {
  lang: Lang
  header: {
    stringConnector: string
  }
  homepage: {
    hero: HeadingProps
  }
}

import { HeadingProps } from "@/components/common/Heading/Heading"

export type Lang = "en" | "fr"

export type Dictionary = {
  lang: Lang
  homepage: {
    hero: HeadingProps
  }
}

// Types
import { Locale } from "@/dictionaries/dictionaries"
import { HeaderProps } from "@/components/common/Header/Header"
import { HeroProps as HomepageHeroProps } from "@/components/custom/Homepage/Hero/Hero"
import { PrivacyPolicyProps } from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import { SimpleFormProps } from "@/components/custom/BeginPage/SimpleForm/SimpleForm"
import { HeroProps as WhyHeroProps } from "@/components/custom/WhyPage/Hero/Hero"
import { StageType } from "@/components/custom/FormPage/Form/Form"
import { HeroProps as ReviewHeroProps } from "@/components/custom/ReviewPage/Hero/Hero"

// Dictionary form stages don't include questions (they come from API)
type DictionaryStage = Omit<StageType, "questions">

export type Dictionary = {
  lang: Locale
  header: HeaderProps
  homepage: {
    hero: HomepageHeroProps
    policy: PrivacyPolicyProps
  }
  begin: SimpleFormProps
  why: {
    hero: WhyHeroProps
  }
  form: {
    buttonNextLabel: string
    buttonPrevLabel: string
    stages: DictionaryStage[]
    checkpoint: {
      buttonLabel: string
    }
  }
  review: ReviewHeroProps
}

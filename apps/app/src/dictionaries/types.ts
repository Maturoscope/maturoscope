// Types
import { Locale } from "@/dictionaries/dictionaries"
import { HeaderProps } from "@/components/common/Header/Header"
import { HeroProps as HomepageHeroProps } from "@/components/custom/Homepage/Hero/Hero"
import { PrivacyPolicyProps } from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import { HeroProps as WhyHeroProps } from "@/components/custom/WhyPage/Hero/Hero"
import { FormProps } from "@/components/custom/FormPage/Form/Form"

export type Dictionary = {
  lang: Locale
  header: HeaderProps
  homepage: {
    hero: HomepageHeroProps
    policy: PrivacyPolicyProps
  }
  why: {
    hero: WhyHeroProps
  }
  form: FormProps
}

// Packages
import Link from "next/link"
// Components
import { Button } from "@/components/ui/button"
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"
import KeysCriteria, {
  KeysCriteriaProps,
} from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"

export interface HeroProps {
  lang: Locale
  heading: HeadingProps & { buttonLabel: string }
  criteria: KeysCriteriaProps
}

const Hero = async ({ lang, heading, criteria }: HeroProps) => {
  const { buttonLabel } = heading

  return (
    <div className="flex items-start justify-between w-full max-w-[1280px] gap-16 px-6">
      <div className="flex flex-col items-start justify-start w-full max-w-[548px] gap-12">
        <Heading {...heading} />
        <Link href={`/${lang}/why`} className="w-full">
          <Button variant="default" size="lg" className="w-full">
            {buttonLabel}
          </Button>
        </Link>
      </div>
      <KeysCriteria {...criteria} />
    </div>
  )
}

export default Hero

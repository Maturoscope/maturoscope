// Components
import { Button } from "@/components/ui/button"
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"
import KeysCriteria, {
  KeysCriteriaProps,
} from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"

export interface HeroProps {
  heading: HeadingProps & { buttonLabel: string }
  criteria: KeysCriteriaProps
}

const Hero = ({ heading, criteria }: HeroProps) => {
  return (
    <div className="flex items-start justify-between w-full max-w-[1280px] gap-16 px-6">
      <div className="flex flex-col items-start justify-start w-full max-w-[548px] gap-12">
        <Heading {...heading} />
        <Button variant="default" size="lg" className="w-full">
          {heading.buttonLabel}
        </Button>
      </div>
      <KeysCriteria {...criteria} />
    </div>
  )
}

export default Hero

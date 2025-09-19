// Components
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"

type HeroProps = HeadingProps

const Hero = ({ title, description, tagline }: HeroProps) => {
  return (
    <div className="flex flex-col items-start justify-start w-full max-w-[548px]">
      <Heading title={title} description={description} tagline={tagline} />
    </div>
  )
}

export default Hero

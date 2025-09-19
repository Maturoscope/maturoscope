// Packages
import Image from "next/image"
// Components
import { Button } from "@/components/ui/button"
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"

export interface HeroProps {
  heading: HeadingProps & {
    list: { icon: string; title: string; description: string }[]
    buttonLabel: string
  }
}

const Hero = ({ heading }: HeroProps) => {
  const { buttonLabel, list } = heading

  return (
    <div className="flex items-start justify-between w-full max-w-[1280px] gap-16 px-6">
      <div className="flex flex-col items-start justify-start w-full max-w-[548px] gap-12">
        <Heading {...heading} />
        <ul className="w-full flex flex-col gap-6">
          {list.map((item) => (
            <li
              key={item.title}
              className="flex items-start justify-start gap-4"
            >
              <div className="flex items-center justify-center aspect-square w-10 h-10 border rounded-md">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={20}
                  height={20}
                />
              </div>
              <div className="flex flex-col items-start justify-start gap-2">
                <p className="text-base font-semibold text-foreground">
                  {item.title}
                </p>
                <span className="text-base text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="default" size="lg" className="w-full">
          {buttonLabel}
        </Button>
      </div>
    </div>
  )
}

export default Hero

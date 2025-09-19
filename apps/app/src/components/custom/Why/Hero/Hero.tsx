// Packages
import Image from "next/image"
// Components
import { Button } from "@/components/ui/button"
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"
// Types
import { ListItem } from "@/types/list-item"

export interface HeroProps {
  heading: HeadingProps & {
    list: ListItem[]
    buttonLabel: string
  }
  checks: ListItem[]
}

const Hero = ({ heading, checks }: HeroProps) => {
  const { buttonLabel, list } = heading

  return (
    <div className="flex items-start justify-between w-full max-w-[1280px] gap-16 px-6">
      <div className="flex flex-col items-start justify-start w-full max-w-[584px] gap-12">
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
      <ul className="w-full max-w-[584px] flex flex-col gap-8">
        {checks.map((item) => (
          <li key={item.title} className="flex items-start justify-start gap-4">
            <Image src={item.icon} alt={item.title} width={20} height={20} />
            <div className="flex flex-col items-start justify-start gap-1">
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
    </div>
  )
}

export default Hero

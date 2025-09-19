// Packages
import Image from "next/image"
// Components
import Box from "@/components/common/Box/Box"
// Types
import { ListItem } from "@/types/list-item"

export interface KeysCriteriaProps {
  title: string
  keys: ListItem[]
}

const KeysCriteria = ({ title, keys }: KeysCriteriaProps) => {
  return (
    <Box>
      <div className="flex flex-col items-start justify-start w-full max-w-[584px] gap-8">
        <span className="text-lg font-semibold text-foreground">{title}</span>
        <div className="flex flex-col items-start justify-start w-full gap-6">
          {keys.map((key) => (
            <div
              key={key.icon}
              className="flex items-start justify-start w-full gap-4"
            >
              <Image src={key.icon} alt={key.title} width={24} height={24} />
              <div className="flex flex-col items-start justify-start gap-1.5">
                <span className="text-base font-semibold text-foreground">
                  {key.title}
                </span>
                <span className="text-base text-muted-foreground">
                  {key.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  )
}

export default KeysCriteria

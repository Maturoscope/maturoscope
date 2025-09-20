// Components
import RadioItem, {
  RadioItemProps,
} from "@/components/common/RadioItem/RadioItem"
// Utils
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  options: RadioItemProps[]
  className?: string
}

const RadioGroup = ({ options, className }: RadioGroupProps) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-4",
        className
      )}
    >
      {options.map((option) => (
        <RadioItem key={option.id} {...option} />
      ))}
    </div>
  )
}

export default RadioGroup

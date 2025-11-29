// Components
import RadioItem, {
  RadioItemProps,
} from "@/components/common/RadioItem/RadioItem"
// Utils
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  options: RadioItemProps[]
  name: string
  className?: string
}

const RadioGroup = ({ options, name, className }: RadioGroupProps) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-1.5 min-h-[480px] lg:max-h-[60vh] overflow-y-auto pb-18",
        className
      )}
    >
      {options.map((option) => (
        <RadioItem key={`${name}-${option.id}`} {...option} />
      ))}
    </div>
  )
}

export default RadioGroup

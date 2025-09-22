// Utils
import { cn } from "@/lib/utils"
// Components
import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  min: number
  max: number
  className?: string
}

const ProgressBar = ({ min, max, className }: ProgressBarProps) => {
  const value = (min / max) * 100
  const label = `${min} of ${max}`

  return (
    <div
      className={cn(
        "w-full flex flex-col items-end justify-end gap-1.5 lg:flex-col-reverse",
        className
      )}
    >
      <Progress value={value} />
      <span className="text-base font-medium">{label}</span>
    </div>
  )
}

export default ProgressBar

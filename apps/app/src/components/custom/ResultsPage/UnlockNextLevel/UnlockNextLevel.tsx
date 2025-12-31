// Utils
import { cn } from "@/lib/utils"

export interface UnlockNextLevelProps {
  title: string
  steps: string[]
  clarification: string
}

interface ExtraProps {
  className?: string
}

const UnlockNextLevel = ({
  title,
  steps,
  clarification,
  className,
}: UnlockNextLevelProps & ExtraProps) => {
  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      <div className="w-full mx-4 lg:mx-6 px-5 py-6 lg:p-8 bg-[#E7E6E4]/50 rounded-xl mt-11 flex flex-col gap-6">
        <h2 className="text-2xl font-medium">{title}</h2>

        <ol className="flex flex-col items-start justify-start list-none">
          {steps.map((step, index) => (
            <li key={step} className="text-base text-foreground/80 flex items-start justify-start gap-1">
              <div className="w-[15px] shrink-0">
                {index + 1}.
              </div>
              {step}
            </li>
          ))}
        </ol>

        <p className="text-base text-foreground/80">{clarification}</p>
      </div>
    </div>
  )
}

export default UnlockNextLevel

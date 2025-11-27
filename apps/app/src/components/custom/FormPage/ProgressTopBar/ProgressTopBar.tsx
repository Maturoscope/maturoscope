"use client"

// Utils
import { cn } from "@/lib/utils"
// Components
import { Progress } from "@/components/ui/progress"
// Context
import { useProgressContext } from "@/context/ProgressContext"
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"

interface ProgressTopBarProps {
  className?: string
}

const ProgressTopBar = ({ className }: ProgressTopBarProps) => {
  const { stages } = useProgressContext()
  const { getValues } = useFormContext()

  const calculateStageProgress = (stageId: StageId) => {
    const stage = stages.find((s) => s.id === stageId)
    if (!stage) return { answered: 0, total: 0, percentage: 0 }

    const total = stage.questions.length
    let answered = 0

    stage.questions.forEach((question) => {
      const value = getValues(
        `${stageId}.questions.${question.id}` as `${StageId}.questions.${string}`
      )
      if (value) answered++
    })

    const percentage = total > 0 ? (answered / total) * 100 : 0

    return { answered, total, percentage }
  }

  return (
    <div
      className={cn(
        "w-full flex flex-col items-end justify-end gap-1.5 lg:flex-col-reverse",
        className
      )}
    >
      {stages.map((stage) => {
        const progress = calculateStageProgress(stage.id)

        return (
          <div key={stage.id} className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-medium">{stage.name}</span>
            </div>
            <Progress value={progress.percentage} />
            <span className="text-base font-medium">
              {progress.answered} of {progress.total}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ProgressTopBar

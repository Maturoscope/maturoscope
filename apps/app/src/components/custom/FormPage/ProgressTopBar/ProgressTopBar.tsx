"use client"

// Utils
import { cn } from "@/lib/utils"
// Components
import { Progress } from "@/components/ui/progress"
import { CheckIcon } from "@/components/icons"
import { getIconComponent } from "@/components/icons/iconMap"
// Context
import { useProgressContext } from "@/context/ProgressContext"
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"

interface ProgressTopBarProps {
  className?: string
}

const STAGES_ICONS = {
  trl: "/icons/homepage/criteria-trl.svg",
  mkrl: "/icons/homepage/criteria-mkrl.svg",
  mfrl: "/icons/homepage/criteria-mfrl.svg",
} as const

const ProgressTopBar = ({ className }: ProgressTopBarProps) => {
  const { stages, currStage, isCheckpoint } = useProgressContext()
  const { getValues } = useFormContext()

  if (isCheckpoint) return

  const calculateStageProgress = (stageId: StageId) => {
    const stage = stages.find((s) => s.id === stageId)
    if (!stage)
      return {
        answered: 0,
        total: 0,
        percentage: 0,
        isCompleted: false,
        minLevel: null,
      }

    const total = stage.questions.length
    let answered = 0
    const answeredLevels: number[] = []

    stage.questions.forEach((question) => {
      const value = getValues(
        `${stageId}.questions.${question.id}` as `${StageId}.questions.${string}`
      )
      if (value) {
        answered++
        const levelNumber = parseInt(value, 10)
        if (!isNaN(levelNumber)) {
          answeredLevels.push(levelNumber)
        }
      }
    })

    const percentage = total > 0 ? (answered / total) * 100 : 0
    const isCompleted = answered === total
    const minLevel =
      isCompleted && answeredLevels.length > 0 ?
        Math.min(...answeredLevels)
      : null

    return { answered, total, percentage, isCompleted, minLevel }
  }

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center bg-white py-4 border-b border-border h-[60px]",
        className
      )}
    >
      <div className="w-full flex gap-3 lg:gap-8 max-w-[750px] px-4">
        {stages.map((stage) => {
          const progress = calculateStageProgress(stage.id)
          const isCurrentStage = stage.id === currStage.id
          const stageIcon = STAGES_ICONS[stage.id]

          return (
            <div
              key={stage.id}
              className="w-full flex items-center justify-between gap-2"
            >
              <div
                className={`w-7 h-7 hidden md:flex items-center justify-center shrink-0 rounded-sm border ${isCurrentStage ? "bg-accent/10" : "bg-white"} ${isCurrentStage ? "border-accent" : "border-border"} ${progress.isCompleted && "bg-accent! border-accent!"}`}
              >
                {(() => {
                  const StageIconComponent = getIconComponent(stageIcon)
                  return StageIconComponent ?
                      <StageIconComponent
                        accent={isCurrentStage}
                        className={`w-[15px] h-[15px] ${progress.isCompleted && "text-white"}`}
                      />
                    : null
                })()}
              </div>

              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-sm",
                        isCurrentStage ? "font-bold" : "font-medium"
                      )}
                    >
                      {stage.name}
                    </span>
                  </div>
                  {isCurrentStage && (
                    <span className="text-xs text-muted-foreground">
                      {progress.answered} of {progress.total}
                    </span>
                  )}

                  {progress.isCompleted && !isCurrentStage && (
                    <span className="flex items-center gap-1">
                      <CheckIcon accent className="w-3 h-3 hidden md:block" />
                      <span className="text-xs font-semibold text-accent">
                        Level {progress.minLevel}
                      </span>
                    </span>
                  )}
                </div>
                <Progress
                  value={progress.percentage}
                  className={`h-[3px] ${
                    progress.isCompleted ? "bg-accent!"
                    : isCurrentStage ? "bg-accent/20!"
                    : "bg-primary/20"
                  }`}
                  progressClassName={`${
                    progress.isCompleted ? "!bg-accent"
                    : isCurrentStage ? "!bg-accent"
                    : "!bg-primary"
                  }`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressTopBar

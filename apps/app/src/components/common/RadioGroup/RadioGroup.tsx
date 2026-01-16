"use client"

// Packages
import { useState, useEffect, useCallback } from "react"
// Components
import RadioItem, {
  RadioItemProps,
} from "@/components/common/RadioItem/RadioItem"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Utils
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  options: RadioItemProps[]
  name: `${StageId}.questions.${string}`
  className?: string
}

const RadioGroup = ({ options, name, className }: RadioGroupProps) => {
  const { getValues } = useFormContext()
  const [commentsPerOption, setCommentsPerOption] = useState<Record<string, string>>({})

  // Extract stage ID and question ID from name (e.g., "trl.questions.TRL_Q1")
  const [stageId, , questionId] = name.split(".") as [StageId, string, string]

  // Initialize comments from saved form data
  useEffect(() => {
    const currentValue = getValues(`${stageId}.questions.${questionId}` as `${StageId}.questions.${string}`)
    const currentComment = getValues(`${stageId}.comments.${questionId}` as `${StageId}.comments.${string}`)

    if (currentValue && currentComment) {
      setCommentsPerOption({ [currentValue]: currentComment })
    }
  }, [stageId, questionId, getValues])

  // Get comment for a specific option
  const getCommentForOption = useCallback((optionId: string) => {
    return commentsPerOption[optionId] || ""
  }, [commentsPerOption])

  // Update comment for a specific option
  const setCommentForOption = useCallback((optionId: string, comment: string) => {
    setCommentsPerOption(prev => ({
      ...prev,
      [optionId]: comment
    }))
  }, [])

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-1.5",
        className
      )}
    >
      {options.map((option) => (
        <RadioItem
          key={`${name}-${option.id}`}
          {...option}
          getCommentForOption={getCommentForOption}
          setCommentForOption={setCommentForOption}
        />
      ))}
    </div>
  )
}

export default RadioGroup

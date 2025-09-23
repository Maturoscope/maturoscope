"use client"

// Packages
import { useState } from "react"
// Components
import Stage from "@/components/custom/FormPage/Stage/Stage"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import { StageType, StageId } from "@/components/custom/FormPage/Stage/Stage"

export interface FormProps {
  buttonNextLabel: string
  buttonPrevLabel: string
  stages: StageType[]
}

const Form = ({ stages, buttonNextLabel, buttonPrevLabel }: FormProps) => {
  const [currStageId, setCurrStageId] = useState<StageId>(stages[0].id)
  const { getValues } = useFormContext()

  const currStage = stages.find(
    (stage) => stage.id === currStageId
  ) as StageType
  const currStageIndex = stages.findIndex((stage) => stage.id === currStageId)
  const nextStage = stages[currStageIndex + 1]

  return (
    <Stage
      stage={currStage}
      nextStage={nextStage}
      buttonNextLabel={buttonNextLabel}
      buttonPrevLabel={buttonPrevLabel}
      getValues={getValues}
      setStage={setCurrStageId}
    />
  )
}

export default Form

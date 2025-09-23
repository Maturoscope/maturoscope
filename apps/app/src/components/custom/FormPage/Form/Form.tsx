"use client"

// Components
import Stage, { StageType } from "@/components/custom/FormPage/Stage/Stage"
// Context
import { useProgressContext } from "@/context/ProgressContext"

export interface FormProps {
  buttonNextLabel: string
  buttonPrevLabel: string
  stages: StageType[]
}

const Form = ({ buttonNextLabel, buttonPrevLabel }: FormProps) => {
  const { currStage, nextStage, setCurrStageId } = useProgressContext()

  return (
    <Stage
      stage={currStage}
      nextStage={nextStage}
      buttonNextLabel={buttonNextLabel}
      buttonPrevLabel={buttonPrevLabel}
      setStage={setCurrStageId}
    />
  )
}

export default Form

"use client"

// Packages
import { useState } from "react"
import { useForm } from "react-hook-form"
// Utils
import {
  DEFAULT_VALUES,
  DefaultValues,
} from "@/components/custom/FormPage/Form/default"
import { Stage as StageType, StageId } from "@/app/[lang]/form/page"
// Components
import Stage from "@/components/custom/FormPage/Stage/Stage"

export interface FormProps {
  buttonNextLabel: string
  buttonPrevLabel: string
  stages: StageType[]
}

const Form = ({ stages }: FormProps) => {
  const [currStageId, setCurrStageId] = useState<StageId>(stages[0].id)
  const currStage = stages.find(
    (stage) => stage.id === currStageId
  ) as StageType
  const { register, handleSubmit } = useForm<DefaultValues>({
    defaultValues: DEFAULT_VALUES,
  })

  return (
    <Stage
      stage={currStage}
      setStage={setCurrStageId}
      register={register}
      handleFinishClick={handleSubmit}
    />
  )
}

export default Form

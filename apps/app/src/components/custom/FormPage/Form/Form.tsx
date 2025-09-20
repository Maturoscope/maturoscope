"use client"

// Packages
import { useState } from "react"
import { useForm } from "react-hook-form"
// Utils
import {
  DEFAULT_VALUES,
  DefaultValues,
} from "@/components/custom/FormPage/Form/default"
import { StageType, StageId } from "@/components/custom/FormPage/Stage/Stage"
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
  const { watch, control, register, handleSubmit } = useForm<DefaultValues>({
    defaultValues: DEFAULT_VALUES,
  })

  console.log(watch())

  return (
    <Stage
      stage={currStage}
      control={control}
      setStage={setCurrStageId}
      register={register}
      handleFinishClick={handleSubmit}
    />
  )
}

export default Form

"use client"

// Packages
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
// Utils
import {
  DEFAULT_VALUES,
  DefaultValues,
} from "@/components/custom/FormPage/Form/default"
import { calcCheckpoint } from "@/lib/calcCheckpoint"
// Components
import Stage from "@/components/custom/FormPage/Stage/Stage"
// Types
import { StageType, StageId } from "@/components/custom/FormPage/Stage/Stage"

export interface FormProps {
  buttonNextLabel: string
  buttonPrevLabel: string
  stages: StageType[]
}

const Form = ({ stages, buttonNextLabel, buttonPrevLabel }: FormProps) => {
  const [currStageId, setCurrStageId] = useState<StageId>(stages[0].id)
  const { getValues, control, reset } = useForm<DefaultValues>({
    defaultValues: DEFAULT_VALUES,
  })

  const currStage = stages.find(
    (stage) => stage.id === currStageId
  ) as StageType
  const currStageIndex = stages.findIndex((stage) => stage.id === currStageId)
  const nextStage = stages[currStageIndex + 1]

  useEffect(() => {
    const savedForm = JSON.parse(localStorage.getItem("form") || "{}")
    if (!savedForm) return
    reset(savedForm)

    // const { lastSavedStage } = calcCheckpoint(savedForm) || {}
    // console.log({ lastSavedStage })
    // if (!lastSavedStage) return
    // setCurrStageId(lastSavedStage)
  }, [reset])

  return (
    <Stage
      stage={currStage}
      nextStage={nextStage}
      buttonNextLabel={buttonNextLabel}
      buttonPrevLabel={buttonPrevLabel}
      control={control}
      getValues={getValues}
      setStage={setCurrStageId}
    />
  )
}

export default Form

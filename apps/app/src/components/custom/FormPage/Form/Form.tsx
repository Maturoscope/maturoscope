"use client"

// Packages
import { useState } from "react"
import { useForm } from "react-hook-form"
// Utils
import { DEFAULT_VALUES } from "@/components/custom/FormPage/Form/default"
import { Stage, StageId } from "@/app/[lang]/form/page"

export interface FormProps {
  buttonNextLabel: string
  buttonPrevLabel: string
  stages: Stage[]
}

const Form = ({ stages }: FormProps) => {
  const [currStage, setCurrStage] = useState<StageId>(stages[0].id)
  const { register, handleSubmit } = useForm({
    defaultValues: DEFAULT_VALUES,
  })

  return <div>Form</div>
}

export default Form

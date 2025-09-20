// Packages
import { useState } from "react"
// Components
import Question from "@/components/custom/FormPage/Question/Question"
// Types
import { Control, UseFormHandleSubmit, UseFormRegister } from "react-hook-form"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
import { QuestionProps } from "@/components/custom/FormPage/Question/Question"

export type StageId = "trl" | "mkrl" | "mfrl"

export interface StageType {
  id: StageId
  icon: string
  name: string
  title: string
  description: string
  buttonLabel: string
  questions: QuestionProps[]
}

export interface StageProps {
  stage: StageType
  control: Control<DefaultValues>
  handleFinishClick: UseFormHandleSubmit<DefaultValues, DefaultValues>
  register: UseFormRegister<DefaultValues>
  setStage: (stage: StageId) => void
}

const Stage = ({ stage, control, setStage, handleFinishClick }: StageProps) => {
  const [currQuestionId, setCurrQuestionId] = useState<string>(
    stage.questions[0].id
  )
  const question = stage.questions.find(
    (question) => question.id === currQuestionId
  ) as QuestionProps

  return (
    <div className="w-full max-w-[1280px] px-6 flex flex-col items-start justify-start">
      <Question {...question} name={stage.id} control={control} />
    </div>
  )
}

export default Stage

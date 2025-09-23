// Packages
import { Control } from "react-hook-form"
// Components
import RadioGroup from "@/components/common/RadioGroup/RadioGroup"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
import { StageId } from "../Stage/Stage"

interface Option {
  id: string
  title: string
}

export interface QuestionProps {
  id: string
  name: string
  title: string
  options: Option[]
  control: Control<DefaultValues>
  onQuestionClick: () => void
}

const Question = ({
  id,
  name,
  options: initOptions,
  control,
  onQuestionClick,
}: QuestionProps) => {
  const radioGroupName = `${name}.${id}` as `${StageId}.${string}`
  const options = initOptions.map((option) => ({
    ...option,
    control,
    name: radioGroupName,
    onClick: onQuestionClick,
  }))

  return (
    <RadioGroup options={options} name={radioGroupName} className="w-full" />
  )
}

export default Question

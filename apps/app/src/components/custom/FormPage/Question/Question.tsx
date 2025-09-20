// Packages
import { Control, UseFormGetValues } from "react-hook-form"
// Components
import RadioGroup from "@/components/common/RadioGroup/RadioGroup"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
import { StageId } from "../Stage/Stage"

interface Option {
  id: string
  title: string
  defaultChecked?: boolean
}

export interface QuestionProps {
  id: string
  name: string
  title: string
  options: Option[]
  control: Control<DefaultValues>
  getValues: UseFormGetValues<DefaultValues>
  onQuestionClick: () => void
}

const Question = ({
  id,
  name,
  options: initOptions,
  control,
  getValues,
  onQuestionClick,
}: QuestionProps) => {
  const radioGroupName = `${name}.${id}` as `${StageId}.${string}`
  const options = initOptions.map((option) => ({
    ...option,
    control,
    name: radioGroupName,
    onClick: onQuestionClick,
    defaultChecked: getValues(radioGroupName) === option.id,
  }))

  return (
    <RadioGroup options={options} name={radioGroupName} className="w-full" />
  )
}

export default Question

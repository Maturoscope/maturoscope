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
}

const Question = ({
  id,
  name,
  title,
  options: initOptions,
  control,
}: QuestionProps) => {
  const radioGroupName = `${name}.${id}` as `${StageId}.${string}`
  const options = initOptions.map((option) => ({
    ...option,
    control,
    name: radioGroupName,
  }))

  return (
    <div className="w-full flex flex-col items-start justify-start gap-7">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <RadioGroup options={options} className="w-full max-w-[600px]" />
    </div>
  )
}

export default Question

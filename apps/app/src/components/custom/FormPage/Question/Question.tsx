// Components
import RadioGroup from "@/components/common/RadioGroup/RadioGroup"
// Types
import { StageId } from "@/components/custom/FormPage/Stage/Stage"

interface Option {
  id: string
  title: string
}

export interface QuestionProps {
  id: string
  name: string
  title: string
  options: Option[]
  onQuestionClick: () => void
}

const Question = ({
  id,
  name,
  options: initOptions,
  onQuestionClick,
}: QuestionProps) => {
  const radioGroupName = `${name}.${id}` as `${StageId}.${string}`
  const options = initOptions.map((option) => ({
    ...option,
    name: radioGroupName,
    onClick: onQuestionClick,
  }))

  return (
    <RadioGroup options={options} name={radioGroupName} className="w-full" />
  )
}

export default Question

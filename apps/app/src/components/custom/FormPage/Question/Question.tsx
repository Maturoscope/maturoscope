// Components
import RadioGroup from "@/components/common/RadioGroup/RadioGroup"
import NotApplicableOption from "@/components/custom/FormPage/NotApplicableOption/NotApplicableOption"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"

interface Option {
  id: string
  title: string
}

export interface QuestionProps {
  id: string
  name: string
  title: string
  options: Option[]
  commentPlaceholder: string
  addNoteLabel: string
  removeNoteLabel: string
  notApplicableLabel: string
  onQuestionClick: () => void
  disabled?: boolean
}

const Question = ({
  id,
  name,
  options: initOptions,
  onQuestionClick,
  commentPlaceholder,
  addNoteLabel,
  removeNoteLabel,
  notApplicableLabel,
  disabled = false,
}: QuestionProps) => {
  const radioGroupName =
    `${name}.questions.${id}` as `${StageId}.questions.${string}`
  const options = initOptions.map((option) => ({
    ...option,
    name: radioGroupName,
    onClick: onQuestionClick,
    commentPlaceholder,
    addNoteLabel,
    removeNoteLabel,
    disabled,
  }))

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col gap-1.5 overflow-y-auto">
      <RadioGroup key={radioGroupName} options={options} name={radioGroupName} />
      <NotApplicableOption
        name={radioGroupName}
        label={notApplicableLabel}
        onClick={onQuestionClick}
        disabled={disabled}
      />
    </div>
  )
}

export default Question

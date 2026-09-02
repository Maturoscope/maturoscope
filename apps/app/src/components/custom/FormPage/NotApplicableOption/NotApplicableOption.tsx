"use client"

// Packages
import { useController } from "react-hook-form"
// Components
import { CheckedIcon, UncheckedIcon } from "@/components/icons"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Utils
import { NOT_APPLICABLE_VALUE } from "@/lib/notApplicable"

interface NotApplicableOptionProps {
  name: `${StageId}.questions.${string}`
  label: string
  onClick: () => void
  disabled?: boolean
}

/**
 * Extra option shown below the answer list. It shares the question's form field
 * so it is mutually exclusive with the maturity levels. Selecting it stores the
 * "not applicable" sentinel (excluded from every result calculation) and clears
 * any note previously written for the question.
 */
const NotApplicableOption = ({
  name,
  label,
  onClick,
  disabled = false,
}: NotApplicableOptionProps) => {
  const { control } = useFormContext()
  const { field } = useController({ control, name })

  const [stageId, , questionId] = name.split(".") as [StageId, string, string]
  const commentName =
    `${stageId}.comments.${questionId}` as `${StageId}.comments.${string}`
  const { field: commentField } = useController({ control, name: commentName })

  const isChecked = field.value === NOT_APPLICABLE_VALUE

  const handleChange = () => {
    if (disabled) return
    field.onChange(NOT_APPLICABLE_VALUE)
    // A "not applicable" answer never carries a note.
    commentField.onChange("")
    onClick()
  }

  return (
    <label
      className={`relative w-full flex items-start justify-start gap-3 rounded-lg border border-input bg-white p-3 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={NOT_APPLICABLE_VALUE}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="peer appearance-none absolute outline-none"
      />
      <div className="absolute top-0 left-0 w-full h-full rounded-[10px] bg-accent/10 border border-accent hidden peer-checked:block" />
      <CheckedIcon
        accent
        className="peer-checked:block hidden relative w-4 h-4"
      />
      <UncheckedIcon className="peer-checked:hidden block relative w-4 h-4" />
      <span className="text-sm font-medium leading-none">{label}</span>
    </label>
  )
}

export default NotApplicableOption

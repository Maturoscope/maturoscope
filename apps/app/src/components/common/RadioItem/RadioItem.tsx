"use client"

// Packages
import { useController } from "react-hook-form"
// Components
import { CheckedIcon, UncheckedIcon } from "@/components/icons"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"

export interface RadioItemProps {
  id: string
  title: string
  name: `${StageId}.questions.${string}`
  onClick: () => void
  commentPlaceholder?: string
  disabled?: boolean
}

const RadioItem = ({
  id,
  title,
  name,
  onClick,
  commentPlaceholder,
  disabled = false,
}: RadioItemProps) => {
  const { control } = useFormContext()
  const { field } = useController({ control, name })
  const isChecked = field.value === id

  // Extract stage ID and question ID from name (e.g., "trl.questions.TRL_Q1")
  const [stageId, , questionId] = name.split(".") as [StageId, string, string]
  const commentName =
    `${stageId}.comments.${questionId}` as `${StageId}.comments.${string}`
  const { field: commentField } = useController({ control, name: commentName })
  const charCount = commentField.value?.length || 0

  const handleChange = () => {
    if (disabled) return
    field.onChange(id)
    onClick()
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    commentField.onChange(e.target.value)
  }

  return (
    <label
      className={`relative w-full flex flex-col items-center justify-start rounded-lg border border-input bg-white ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <div className="flex items-start justify-start gap-3 w-full z-20 -mt-px p-3">
        <input
          type="radio"
          {...field}
          onChange={handleChange}
          name={name}
          value={id}
          checked={isChecked}
          disabled={disabled}
          className="peer appearance-none absolute outline-none"
        />
        <div className="absolute top-0 left-0 w-full h-full rounded-[10px] bg-accent/10 border border-accent hidden peer-checked:block" />
        <CheckedIcon
          accent
          className="peer-checked:block hidden relative w-4 h-4"
        />
        <UncheckedIcon className="peer-checked:hidden block relative w-4 h-4" />
        <span className="text-sm font-medium leading-none">{title}</span>
      </div>
      {isChecked && (
        <div className="w-[calc(100%-56px)] p-3 pt-0 flex flex-col items-end gap-2 relative z-20">
          <textarea
            maxLength={280}
            onChange={handleCommentChange}
            value={commentField.value || ""}
            placeholder={commentPlaceholder}
            disabled={disabled}
            className={`bg-white w-full h-full resize-none border border-border rounded-md py-2 px-3 text-sm placeholder:text-muted-foreground outline-none ${disabled ? "cursor-not-allowed" : ""}`}
          />
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground">{charCount}</span>/280
          </span>
        </div>
      )}
    </label>
  )
}

export default RadioItem

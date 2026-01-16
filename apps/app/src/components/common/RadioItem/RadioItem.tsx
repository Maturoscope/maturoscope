"use client"

// Packages
import { useEffect, useRef } from "react"
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
  getCommentForOption?: (optionId: string) => string
  setCommentForOption?: (optionId: string, comment: string) => void
}

const RadioItem = ({
  id,
  title,
  name,
  onClick,
  commentPlaceholder,
  disabled = false,
  getCommentForOption,
  setCommentForOption,
}: RadioItemProps) => {
  const { control } = useFormContext()
  const { field } = useController({ control, name })
  const isChecked = field.value === id
  const wasCheckedRef = useRef(isChecked)

  // Extract stage ID and question ID from name (e.g., "trl.questions.TRL_Q1")
  const [stageId, , questionId] = name.split(".") as [StageId, string, string]
  const commentName =
    `${stageId}.comments.${questionId}` as `${StageId}.comments.${string}`
  const { field: commentField } = useController({ control, name: commentName })

  // Get the comment for this option from the parent's state
  const optionComment = getCommentForOption ? getCommentForOption(id) : ""
  const charCount = optionComment.length

  // When this option becomes checked, load its comment into the form field
  useEffect(() => {
    if (isChecked && !wasCheckedRef.current && getCommentForOption) {
      const savedComment = getCommentForOption(id)
      commentField.onChange(savedComment)
    }
    wasCheckedRef.current = isChecked
  }, [isChecked, id, getCommentForOption, commentField])

  const handleChange = () => {
    if (disabled) return
    field.onChange(id)
    // Load this option's comment into the form field
    if (getCommentForOption) {
      const savedComment = getCommentForOption(id)
      commentField.onChange(savedComment)
    }
    onClick()
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    // Update the form field
    commentField.onChange(newValue)
    // Also save to the per-option state
    if (setCommentForOption) {
      setCommentForOption(id, newValue)
    }
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
            value={optionComment}
            placeholder={commentPlaceholder}
            disabled={disabled}
            className={`bg-white w-full resize-none border border-border rounded-md py-2 px-3 text-sm placeholder:text-muted-foreground outline-none h-[130px] lg:h-[76px] ${disabled ? "cursor-not-allowed" : ""}`}
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

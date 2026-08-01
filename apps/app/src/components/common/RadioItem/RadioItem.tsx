"use client"

// Packages
import { useEffect, useRef, useState } from "react"
import { useController } from "react-hook-form"
import { AnimatePresence, motion } from "motion/react"
import { FilePlus2 } from "lucide-react"
// Components
import { CheckedIcon, UncheckedIcon } from "@/components/icons"
// Animations
import { EASE_OUT } from "@/animations/common"
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
  addNoteLabel?: string
  removeNoteLabel?: string
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
  addNoteLabel,
  removeNoteLabel,
  disabled = false,
  getCommentForOption,
  setCommentForOption,
}: RadioItemProps) => {
  const { control } = useFormContext()
  const { field } = useController({ control, name })
  const isChecked = field.value === id
  const wasCheckedRef = useRef(isChecked)

  // Tracks an explicit "Add note" click (used to reveal an empty textarea).
  // The textarea is also shown automatically whenever a note already exists.
  const [showNote, setShowNote] = useState(false)

  // Extract stage ID and question ID from name (e.g., "trl.questions.TRL_Q1")
  const [stageId, , questionId] = name.split(".") as [StageId, string, string]
  const commentName =
    `${stageId}.comments.${questionId}` as `${StageId}.comments.${string}`
  const { field: commentField } = useController({ control, name: commentName })

  // Get the comment for this option from the parent's state
  const optionComment = getCommentForOption ? getCommentForOption(id) : ""
  const charCount = optionComment.length
  const hasComment = optionComment.trim().length > 0
  // Show the textarea whenever the user explicitly opened it OR a note exists.
  const isNoteOpen = showNote || hasComment

  // When this option becomes checked, load its saved comment into the form field.
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

  const handleAddNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNote(true)
  }

  const handleRemoveNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    commentField.onChange("")
    if (setCommentForOption) {
      setCommentForOption(id, "")
    }
    setShowNote(false)
  }

  // Aligns the optional-note area with the option text (radio icon + gaps).
  const NOTE_INDENT = "pl-10 pr-3 pb-3"

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

      <AnimatePresence initial={false} mode="wait">
        {isChecked && !isNoteOpen && !disabled && (
          <motion.div
            key="add-note"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="w-full overflow-hidden relative z-20"
          >
            <div className={NOTE_INDENT}>
              <button
                type="button"
                onClick={handleAddNote}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-white px-3 py-1.5 text-sm font-medium text-foreground hover:bg-neutral-50 transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                {addNoteLabel}
              </button>
            </div>
          </motion.div>
        )}

        {isChecked && isNoteOpen && (
          <motion.div
            key="note-field"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="w-full overflow-hidden relative z-20"
          >
            <div className={`${NOTE_INDENT} flex flex-col gap-2`}>
              <textarea
                maxLength={280}
                onChange={handleCommentChange}
                value={optionComment}
                placeholder={commentPlaceholder}
                disabled={disabled}
                className={`bg-white w-full resize-none border border-border rounded-md py-2 px-3 text-sm placeholder:text-muted-foreground outline-none h-[130px] lg:h-[76px] ${disabled ? "cursor-not-allowed" : ""}`}
              />
              <div className="flex items-center justify-between w-full">
                {!disabled ? (
                  <button
                    type="button"
                    onClick={handleRemoveNote}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {removeNoteLabel}
                  </button>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground">{charCount}</span>/280
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </label>
  )
}

export default RadioItem

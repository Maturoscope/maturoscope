"use client"

// Packages
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
import { CheckedIcon, UncheckedIcon } from "@/components/icons"
import UnsavedChangesModal from "@/components/custom/ReviewPage/UnsavedChangesModal/UnsavedChangesModal"
// Types
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
import { UnsavedChangesModalProps } from "@/components/custom/ReviewPage/UnsavedChangesModal/UnsavedChangesModal"
// Utils
import { cn } from "@/lib/utils"
// Actions
import { submitAssessment, ScaleType } from "@/actions/organization"

const STAGE_TO_SCALE: Record<StageId, ScaleType> = {
  trl: "TRL",
  mkrl: "MkRL",
  mfrl: "MfRL",
}

export interface QuestionEditorProps {
  saveButtonLabel: string
  cancelButtonLabel: string
  commentPlaceholder: string
  unsavedChangesModal: UnsavedChangesModalProps
}

export interface ExtraProps {
  stageName: StageId
  lang: Locale
  question: QuestionData
}

const QuestionEditor = ({
  saveButtonLabel,
  cancelButtonLabel,
  commentPlaceholder,
  unsavedChangesModal,
  stageName,
  lang,
  question,
}: QuestionEditorProps & ExtraProps) => {
  const router = useRouter()
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [commentsPerOption, setCommentsPerOption] = useState<Record<string, string>>({})
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState<boolean>(false)
  const [initialOptionId, setInitialOptionId] = useState<string | null>(null)
  const [initialComment, setInitialComment] = useState<string>("")

  // Get the current comment for the selected option
  const comment = selectedOptionId ? (commentsPerOption[selectedOptionId] || "") : ""

  useEffect(() => {
    // Read selected answer and comment from localStorage
    const savedForm = JSON.parse(
      localStorage.getItem("form") || "{}"
    ) as DefaultValues

    const answerId = savedForm[stageName]?.questions?.[question.id] || null
    const savedComment = savedForm[stageName]?.comments?.[question.id] || ""
    setSelectedOptionId(answerId)
    // Initialize the comments map with the saved comment for the saved option
    if (answerId) {
      setCommentsPerOption({ [answerId]: savedComment })
    }
    // Store initial values for comparison
    setInitialOptionId(answerId)
    setInitialComment(savedComment)
  }, [stageName, question.id])

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return selectedOptionId !== initialOptionId || comment !== initialComment
  }

  const handleOptionChange = (optionId: string) => {
    setSelectedOptionId(optionId)
    // Comments are now stored per option, no need to clear
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedOptionId) return
    // Store the comment for the currently selected option
    setCommentsPerOption(prev => ({
      ...prev,
      [selectedOptionId]: e.target.value
    }))
  }

  const handleSaveClick = async () => {
    if (!selectedOptionId) return

    // Read current form data from localStorage
    const savedForm = JSON.parse(
      localStorage.getItem("form") || "{}"
    ) as DefaultValues

    // Update the answer and comment for this question
    const updatedForm = {
      ...savedForm,
      [stageName]: {
        ...savedForm[stageName],
        questions: {
          ...savedForm[stageName]?.questions,
          [question.id]: selectedOptionId,
        },
        comments: {
          ...savedForm[stageName]?.comments,
          [question.id]: comment,
        },
      },
    }

    // Save back to localStorage
    localStorage.setItem("form", JSON.stringify(updatedForm))

    // Submit assessment to the backend
    const scale = STAGE_TO_SCALE[stageName]
    const answers = updatedForm[stageName].questions
    await submitAssessment({ scale, answers })

    // Update initial values to reflect saved state
    setInitialOptionId(selectedOptionId)
    setInitialComment(comment)

    // Navigate back to review page with saved flag to show toast
    router.push(`/${lang}/review/${stageName}?saved=true`)
  }

  const handleCancelClick = () => {
    // If there are unsaved changes, show the modal
    if (hasUnsavedChanges()) {
      setIsUnsavedChangesModalOpen(true)
    } else {
      // No changes, navigate directly
      router.push(`/${lang}/review/${stageName}`)
    }
  }

  const handleResetClick = () => {
    // Navigate away and discard changes (called from modal)
    router.push(`/${lang}/review/${stageName}`)
  }

  const radioGroupName = `${stageName}.questions.${question.id}`

  return (
    <div className="w-full max-w-[750px] flex-1 min-h-0 px-4 flex flex-col items-start mt-7 lg:box-content">
      <UnsavedChangesModal
        {...unsavedChangesModal}
        isOpen={isUnsavedChangesModalOpen}
        setIsOpen={setIsUnsavedChangesModalOpen}
        onResetClick={handleResetClick}
      />

      <div className="w-full flex flex-col items-start justify-start gap-2 mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-3xl font-semibold">{question.title}</h1>
      </div>
      <div
        className={cn(
          "w-full flex flex-col items-start justify-start gap-1.5 flex-1 min-h-0 overflow-y-auto"
        )}
      >
        {question.options.map((option) => {
          const isChecked = selectedOptionId === option.id
          return (
            <label
              key={option.id}
              className="relative w-full flex flex-col items-center justify-start rounded-lg border border-input cursor-pointer bg-white"
            >
              <div className="flex items-start justify-start gap-3 w-full z-20 -mt-px p-3">
                <input
                  type="radio"
                  name={radioGroupName}
                  value={option.id}
                  checked={isChecked}
                  onChange={() => handleOptionChange(option.id)}
                  className="peer appearance-none absolute outline-none"
                />
                <div className="absolute top-0 left-0 w-full h-full rounded-[10px] bg-accent/10 border border-accent hidden peer-checked:block" />
                <CheckedIcon
                  accent
                  className={cn(
                    "relative w-4 h-4",
                    isChecked ? "block" : "hidden"
                  )}
                />
                <UncheckedIcon
                  className={cn(
                    "relative w-4 h-4",
                    isChecked ? "hidden" : "block"
                  )}
                />
                <span className="text-sm font-medium leading-none">
                  {option.title}
                </span>
              </div>
              {isChecked && (
                <div className="w-[calc(100%-56px)] p-3 pt-0 flex flex-col items-end gap-2 relative z-20">
                  <textarea
                    maxLength={280}
                    onChange={handleCommentChange}
                    value={comment}
                    placeholder={commentPlaceholder}
                    className="bg-white w-full resize-none border border-border rounded-md py-2 px-3 text-sm placeholder:text-muted-foreground outline-none h-[130px] lg:h-[76px]"
                    aria-label="Add comment"
                  />
                  <span className="text-xs text-muted-foreground">
                    <span className="text-foreground">
                      {comment.length}
                    </span>
                    /280
                  </span>
                </div>
              )}
            </label>
          )
        })}
      </div>
      <div className="w-full flex items-center justify-between gap-3 bg-background lg:bg-none py-4 lg:pt-6 lg:pb-8">
        <Button variant="outline" onClick={handleCancelClick}>
          {cancelButtonLabel}
        </Button>
        <Button
          onClick={handleSaveClick}
          disabled={!selectedOptionId || !hasUnsavedChanges()}
          className="w-full lg:w-auto"
          accent
        >
          {saveButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default QuestionEditor

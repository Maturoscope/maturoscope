"use client"

// Packages
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
import { CheckedIcon, UncheckedIcon } from "@/components/icons"
// Types
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
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
  stageName: StageId
  lang: Locale
  question: QuestionData
}

const QuestionEditor = ({
  saveButtonLabel,
  cancelButtonLabel,
  commentPlaceholder,
  stageName,
  lang,
  question,
}: QuestionEditorProps) => {
  const router = useRouter()
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [comment, setComment] = useState<string>("")

  useEffect(() => {
    // Read selected answer and comment from localStorage
    const savedForm = JSON.parse(
      localStorage.getItem("form") || "{}"
    ) as DefaultValues

    const answerId = savedForm[stageName]?.questions?.[question.id] || null
    const savedComment = savedForm[stageName]?.comments?.[question.id] || ""
    setSelectedOptionId(answerId)
    setComment(savedComment)
  }, [stageName, question.id])

  const handleOptionChange = (optionId: string) => {
    setSelectedOptionId(optionId)
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
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

    // Navigate back to review page
    router.push(`/${lang}/review/${stageName}`)
  }

  const handleCancelClick = () => {
    router.push(`/${lang}/review/${stageName}`)
  }

  const radioGroupName = `${stageName}.questions.${question.id}`

  return (
    <div className="w-full max-w-[750px] flex-1 min-h-0 px-4 flex flex-col items-start mt-7 lg:box-content">
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
      <div className="w-full flex items-center justify-end gap-3 bg-background lg:bg-none py-4 lg:pt-6 lg:pb-8">
        <Button variant="outline" onClick={handleCancelClick}>
          {cancelButtonLabel}
        </Button>
        <Button
          onClick={handleSaveClick}
          disabled={!selectedOptionId}
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

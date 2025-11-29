"use client"

// Packages
import { useRouter } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"

interface AnswerProps {
  stageName: StageId
  lang: Locale
  questionId: string
  question: string
  answer: string
}

const Answer = ({
  stageName,
  lang,
  questionId,
  question,
  answer,
}: AnswerProps) => {
  const router = useRouter()

  const handleEditClick = () => {
    router.push(`/${lang}/review/${stageName}/${questionId}`)
  }

  return (
    <div className="w-full flex flex-col items-start justify-start gap-3 bg-white p-5 lg:p-6 rounded-lg border border-border">
      <p className="text-base font-semibold">{question}</p>
      <div className="w-full flex gap-2 justify-between items-center">
        <p className="text-sm text-muted-foreground w-full px-3 py-2 rounded-md border border-border">
          {answer}
        </p>
        <Button
          variant="outline"
          className="shrink-0"
          onClick={handleEditClick}
        >
          Edit
        </Button>
      </div>
    </div>
  )
}

export default Answer

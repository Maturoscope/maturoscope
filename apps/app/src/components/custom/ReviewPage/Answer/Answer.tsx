// Components
import { Button } from "@/components/ui/button"

interface AnswerProps {
  question: string
  answer: string
}

const Answer = ({ question, answer }: AnswerProps) => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-3 bg-white p-5 lg:p-6 rounded-lg border border-border">
      <p className="text-base font-semibold">{question}</p>
      <div className="w-full flex gap-2 justify-between items-center">
        <p className="text-sm text-muted-foreground w-full px-3 py-2 rounded-md border border-border">
          {answer}
        </p>
        <Button variant="outline" className="shrink-0">
          Edit
        </Button>
      </div>
    </div>
  )
}

export default Answer

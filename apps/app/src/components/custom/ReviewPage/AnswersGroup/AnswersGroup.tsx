"use client"

// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"
// Hooks
import useStageAnswers from "@/hooks/useStageAnswers"
// Components
import Answer from "@/components/custom/ReviewPage/Answer/Answer"

interface AnswersGroupProps {
  stageName: StageId
  lang: Locale
}

const AnswersGroup = ({ stageName, lang }: AnswersGroupProps) => {
  const questionsAndAnswers = useStageAnswers(stageName, lang)

  return (
    <div className="w-full flex flex-col items-center justify-start gap-3 px-4 lg:p-6 !pt-0">
      {questionsAndAnswers.map((questionAndAnswer) => (
        <Answer
          key={questionAndAnswer.questionId}
          stageName={stageName}
          lang={lang}
          {...questionAndAnswer}
        />
      ))}
    </div>
  )
}

export default AnswersGroup

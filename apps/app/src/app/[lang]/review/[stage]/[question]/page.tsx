// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { StageData } from "@/types/shared"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import QuestionEditor from "@/components/custom/ReviewPage/QuestionEditor/QuestionEditor"
// Next
import { cookies } from "next/headers"

interface QuestionPageProps {
  params: Promise<{ lang: Locale; stage: StageId; question: string }>
}

const QuestionPage = async ({ params }: QuestionPageProps) => {
  const { lang, stage, question: questionId } = await params
  const dictionary = await getDictionary(lang)
  const {
    header: { stringConnector },
    form: { leaveQuestionnaireModal },
    singleReview,
  } = dictionary

  // Fetch questions from internal API Route
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost')
    ? 'http://localhost:3000'
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  const response = await fetch(`${baseUrl}/api/questions?lang=${lang}`, {
    headers: {
      'Cookie': (await cookies()).toString(),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load questions')
  }

  const result = await response.json()
  if (!result.success || !result.data) {
    throw new Error('Failed to load questions')
  }

  const questionsStages: StageData[] = result.data
  const stageQuestions = questionsStages.find((qs) => qs.id === stage)

  if (!stageQuestions) {
    throw new Error(`Failed to load questions for stage: ${stage}`)
  }

  // Find the specific question
  const question = stageQuestions.questions.find((q) => q.id === questionId)

  if (!question) {
    throw new Error(`Question not found: ${questionId}`)
  }

  // Get selected answer from localStorage (we'll need to pass this to client component)
  // Since we can't access localStorage in server components, we'll handle it in the client component

  return (
    <main className="w-full h-full flex flex-col items-center justify-start lg:pb-16">
      <Header stringConnector={stringConnector} showBackButton leaveQuestionnaireModal={leaveQuestionnaireModal} />
      <QuestionEditor
        stageName={stage}
        lang={lang}
        question={question}
        saveButtonLabel={singleReview.saveButtonLabel}
        cancelButtonLabel={singleReview.cancelButtonLabel}
        commentPlaceholder={singleReview.commentPlaceholder}
        unsavedChangesModal={singleReview.unsavedChangesModal}
      />
    </main>
  )
}

export default QuestionPage

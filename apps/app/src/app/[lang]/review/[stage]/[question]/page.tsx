// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import QuestionEditor from "@/components/custom/ReviewPage/QuestionEditor/QuestionEditor"
// Actions
import { getQuestions } from "@/actions/questions"

interface QuestionPageProps {
  params: Promise<{ lang: Locale; stage: StageId; question: string }>
}

const QuestionPage = async ({ params }: QuestionPageProps) => {
  const { lang, stage, question: questionId } = await params
  const dictionary = await getDictionary(lang)
  const {
    header: { stringConnector },
  } = dictionary

  // Fetch questions for the stage
  const questionsStages = await getQuestions(lang)
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
    <main className="w-full h-full flex flex-col items-center justify-start pb-16">
      <Header stringConnector={stringConnector} showBackButton />
      <QuestionEditor stageName={stage} lang={lang} question={question} />
    </main>
  )
}

export default QuestionPage

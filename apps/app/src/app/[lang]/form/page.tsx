// Components
import Header from "@/components/common/Header/Header"
import Form from "@/components/custom/FormPage/Form/Form"
import ProgressTopBar from "@/components/custom/FormPage/ProgressTopBar/ProgressTopBar"
import CheckpointTopBar from "@/components/custom/FormPage/CheckpointTopBar/CheckpointTopBar"
// Context
import { FormProvider } from "@/context/FormContext"
import { ProgressProvider } from "@/context/ProgressContext"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageData } from "@/types/shared"
// Next
import { cookies } from "next/headers"

interface FormPageProps {
  params: Promise<{ lang: Locale }>
}

const FormPage = async ({ params }: FormPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const {
    form,
    header: { stringConnector },
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

  const stages = form.stages.map((stage) => {
    const questionsStage = questionsStages.find((qs) => qs.id === stage.id)
    if (!questionsStage) {
      throw new Error(`Failed to load questions for stage: ${stage.id}`)
    }
    return {
      ...stage,
      questions: questionsStage.questions,
    }
  })

  return (
    <FormProvider>
      <ProgressProvider lang={lang} stages={stages}>
        <main className="w-full h-full flex flex-col items-center justify-start">
          <Header stringConnector={stringConnector} showBackButton leaveQuestionnaireModal={form.leaveQuestionnaireModal} />
          <ProgressTopBar />
          <CheckpointTopBar buttonLabel={form.checkpoint.buttonLabel} />
          <Form
            buttonNextLabel={form.buttonNextLabel}
            buttonPrevLabel={form.buttonPrevLabel}
            commentPlaceholder={form.commentPlaceholder}
          />
        </main>
      </ProgressProvider>
    </FormProvider>
  )
}

export default FormPage

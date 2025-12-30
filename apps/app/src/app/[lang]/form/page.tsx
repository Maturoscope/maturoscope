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
// Actions
import { getQuestions } from "@/actions/questions"

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

  const questionsStages = await getQuestions(lang)

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

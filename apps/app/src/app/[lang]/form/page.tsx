// Components
import Form from "@/components/custom/FormPage/Form/Form"
// Context
import { FormProvider } from "@/context/FormContext"
import { ProgressProvider } from "@/context/ProgressContext"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"

interface FormPageProps {
  params: Promise<{ lang: Locale }>
}

const FormPage = async ({ params }: FormPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const { form } = dictionary

  return (
    <main className="w-full h-full flex flex-col items-center justify-start pb-16">
      <FormProvider>
        <ProgressProvider stages={form.stages}>
          <Form {...form} />
        </ProgressProvider>
      </FormProvider>
    </main>
  )
}

export default FormPage

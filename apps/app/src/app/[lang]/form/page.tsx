// Components
import Form from "@/components/custom/FormPage/Form/Form"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface FormPageProps {
  params: Promise<{ lang: Locale }>
}

const FormPage = async ({ params }: FormPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const { form } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <Form {...form} />
    </main>
  )
}

export default FormPage

// Packages
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface Option {
  id: string
  title: string
}

interface Question {
  id: string
  title: string
  options: Option[]
}

export interface Stage {
  id: string
  icon: string
  name: string
  title: string
  description: string
  buttonLabel: string
  questions: Question[]
}

interface FormProps {
  params: Promise<{ lang: Locale }>
}

const Form = async ({ params }: FormProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  console.log(dictionary)

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <h1>Form</h1>
    </main>
  )
}

export default Form

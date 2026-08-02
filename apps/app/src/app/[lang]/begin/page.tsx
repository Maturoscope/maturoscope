// Components
import SimpleForm from "@/components/custom/BeginPage/SimpleForm/SimpleForm"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type BeginPageProps = {
  params: Promise<{ lang: string }>
}

const BeginPage = async ({ params }: BeginPageProps) => {
  const { lang: langParam } = await params
  const lang: Locale = (langParam === "en" || langParam === "fr") ? langParam : "en"
  const dictionary = await getDictionary(lang)

  const {
    common: { loadingLabel },
    form: { leaveQuestionnaireModal },
    begin,
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between flex-1 min-h-0">
      <SimpleForm {...begin} loadingLabel={loadingLabel} leaveQuestionnaireModal={leaveQuestionnaireModal} />
    </main>
  )
}

export default BeginPage

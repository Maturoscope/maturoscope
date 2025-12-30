// Components
import Header from "@/components/common/Header/Header"
import SimpleForm from "@/components/custom/BeginPage/SimpleForm/SimpleForm"
import OrganizationKeyHandler from "@/components/common/OrganizationKeyHandler/OrganizationKeyHandler"
import FormRedirectHandler from "@/components/common/FormRedirectHandler/FormRedirectHandler"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type BeginPageProps = {
  params: Promise<{ lang: Locale }>
}

const BeginPage = async ({ params }: BeginPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  const {
    header: { stringConnector },
    form: { leaveQuestionnaireModal },
    begin,
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <FormRedirectHandler />
      <OrganizationKeyHandler />
      <Header stringConnector={stringConnector} showBackButton leaveQuestionnaireModal={leaveQuestionnaireModal} />
      <SimpleForm {...begin} />
    </main>
  )
}

export default BeginPage

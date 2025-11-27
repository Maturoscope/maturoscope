// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Header from "@/components/common/Header/Header"
import SimpleForm from "@/components/custom/BeginPage/SimpleForm/SimpleForm"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type BeginPageProps = {
  searchParams: Promise<{ key?: string }>
  params: Promise<{ lang: Locale }>
}

const BeginPage = async ({ searchParams, params }: BeginPageProps) => {
  const { key } = await searchParams
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const organization = key ? await getOrganizationByKey(key) : null

  console.log({ organization })

  const {
    header: { stringConnector },
    begin,
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <Header stringConnector={stringConnector} showBackButton />
      <SimpleForm {...begin} />
    </main>
  )
}

export default BeginPage

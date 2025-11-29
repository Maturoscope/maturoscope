// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Header from "@/components/common/Header/Header"
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import OrganizationKeyHandler from "@/components/common/OrganizationKeyHandler/OrganizationKeyHandler"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type HomePageProps = {
  searchParams: Promise<{ key?: string }>
  params: Promise<{ lang: Locale }>
}

const HomePage = async ({ searchParams, params }: HomePageProps) => {
  const { key } = await searchParams
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const organization = key ? await getOrganizationByKey(key) : null

  console.log({ organization })

  const {
    header: { stringConnector },
    homepage: { hero, policy },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <OrganizationKeyHandler />
      <Header stringConnector={stringConnector} />
      <Hero {...hero} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default HomePage

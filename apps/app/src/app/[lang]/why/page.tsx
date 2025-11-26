// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/WhyPage/Hero/Hero"
import Header from "@/components/common/Header/Header"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface WhyPageProps {
  searchParams: Promise<{ key: string }>
  params: Promise<{ lang: Locale }>
}

const WhyPage = async ({ searchParams, params }: WhyPageProps) => {
  const { key } = await searchParams
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const organization = await getOrganizationByKey(key)

  console.log({ organization })

  const {
    header: { stringConnector },
    why: { hero },
    homepage: { policy },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-center h-full">
      <Header stringConnector={stringConnector} showBackButton />
      <Hero {...hero} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default WhyPage

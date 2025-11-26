// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
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
    homepage: { hero, policy },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between mt-14 h-full">
      <Hero {...hero} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default HomePage

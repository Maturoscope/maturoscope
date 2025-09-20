// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type HomeProps = {
  searchParams: Promise<{ key?: string }>
  params: Promise<{ lang: Locale }>
}

const Home = async ({ searchParams, params }: HomeProps) => {
  const { key } = await searchParams
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const organization = key ? await getOrganizationByKey(key) : null

  console.log({ organization })

  const {
    lang: langFromDictionary,
    homepage: { hero, policy },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <Hero {...hero} lang={langFromDictionary} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default Home

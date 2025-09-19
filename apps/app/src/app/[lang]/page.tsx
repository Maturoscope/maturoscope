// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface HomeProps {
  searchParams: {
    key: string
  }
  params: Promise<{ lang: Locale }>
}

const Home = async ({ searchParams, params }: HomeProps) => {
  const { key } = searchParams
  const { lang } = await params
  const organization = await getOrganizationByKey(key)

  console.log({ organization })

  const dictionary = await getDictionary(lang)

  const {
    homepage: { hero, policy },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <Hero {...hero} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default Home
